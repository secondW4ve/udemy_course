package com.waver;

import com.waver.configuration.AppConfiguration;
import com.waver.error.ApiError;
import com.waver.model.TestUtil;
import com.waver.model.file.FileAttachment;
import com.waver.model.file.FileAttachmentRepository;
import com.waver.model.user.User;
import com.waver.model.user.UserRepository;
import com.waver.model.wave.Wave;
import com.waver.model.wave.WaveRepository;
import com.waver.model.wave.WaveViewModel;
import com.waver.services.FileService;
import com.waver.services.UserService;
import com.waver.services.WaveService;
import com.waver.shared.GenericResponse;
import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest( webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class WaveControllerTest {

    public static final String API_1_0_WAVES = "/api/1.0/waves";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @Autowired
    WaveService waveService;

    @Autowired
    WaveRepository waveRepository;

    @Autowired
    FileAttachmentRepository fileAttachmentRepository;

    @Autowired
    FileService fileService;

    @Autowired
    AppConfiguration appConfiguration;

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    @Before
    public void cleanupDatabase() throws IOException {
        fileAttachmentRepository.deleteAll();
        waveRepository.deleteAll();
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
        FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsAuthorized_receiveOK(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = TestUtil.createValidWave();
        ResponseEntity<Object> response = postWave(wave, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsUnauthorized_receiveUnauthorized(){

        Wave wave = TestUtil.createValidWave();
        ResponseEntity<Object> response = postWave(wave, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsUnauthorized_receiveApiError(){

        Wave wave = TestUtil.createValidWave();
        ResponseEntity<ApiError> response = postWave(wave, ApiError.class);

        assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsAuthorized_waveSavedToDatabase(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = TestUtil.createValidWave();
        postWave(wave, Object.class);

        assertThat(waveRepository.count()).isEqualTo(1);
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsAuthorized_waveSavedToDatabaseWithTimestamp(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = TestUtil.createValidWave();
        postWave(wave, Object.class);
        Wave waveInDb = waveRepository.findAll().get(0);

        assertThat(waveInDb.getTimestamp()).isNotNull();
    }

    @Test
    public void postWave_whenWaveContentIsNullAndUserIsAuthorized_receiveBadRequest(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = new Wave();
        ResponseEntity<Object> response = postWave(wave, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postWave_whenWaveContentLessThan10charsAndUserIsAuthorized_receiveBadRequest(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = new Wave();
        wave.setContent("123456789");
        ResponseEntity<Object> response = postWave(wave, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postWave_whenWaveContentIs5000charsAndUserIsAuthorized_receiveOK(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = new Wave();
        String longContent = IntStream.rangeClosed(1, 5000).mapToObj(i -> "x").collect(Collectors.joining());
        wave.setContent(longContent);
        ResponseEntity<Object> response = postWave(wave, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postWave_whenWaveContentIsMoreThan5000charsAndUserIsAuthorized_receiveBadRequest(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = new Wave();
        String longContent = IntStream.rangeClosed(1, 5001).mapToObj(i -> "x").collect(Collectors.joining());
        wave.setContent(longContent);
        ResponseEntity<Object> response = postWave(wave, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postWave_whenWaveContentIsNullAndUserIsAuthorized_receiveApiErrorWithValidationErrors(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = new Wave();
        ResponseEntity<ApiError> response = postWave(wave, ApiError.class);
        Map<String,String> validationErrors = response.getBody().getValidationErrors();

        assertThat(validationErrors.get("content")).isNotNull();
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsAuthorized_waveSavedWithAuthenticatedUserInfo(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = TestUtil.createValidWave();
        postWave(wave, Object.class);
        Wave waveInDb = waveRepository.findAll().get(0);

        assertThat(waveInDb.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsAuthorized_waveCanBeAccessedFromUserEntity(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = TestUtil.createValidWave();
        postWave(wave, Object.class);
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        User userInDb = entityManager.find(User.class, user.getId());

        assertThat(userInDb.getWaves().size()).isEqualTo(1);
    }

    @Test
    public void postWave_whenWaveHasFileAttachmentAndUserIsAuthorized_fileAttachmentWaveRelationIsUpdatedInDb() throws IOException {
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        MultipartFile file = createFile();
        FileAttachment savedFile = fileService.saveAttachment(file);

        Wave wave = TestUtil.createValidWave();
        wave.setAttachment(savedFile);
        ResponseEntity<WaveViewModel> response = postWave(wave, WaveViewModel.class);

        FileAttachment attachmentInDb = fileAttachmentRepository.findAll().get(0);

        assertThat(attachmentInDb.getWave().getId()).isEqualTo(response.getBody().getId());
    }

    private MultipartFile createFile() throws IOException {
        ClassPathResource imageResource = new ClassPathResource("profile.png");
        byte[] fileAsByte = FileUtils.readFileToByteArray(imageResource.getFile());
        return new MockMultipartFile("profile.png", fileAsByte);
    }

    @Test
    public void postWave_whenWaveHasFileAttachmentAndUserIsAuthorized_waveFileAttachmentRelationIsUpdatedInDb() throws IOException {
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        MultipartFile file = createFile();
        FileAttachment savedFile = fileService.saveAttachment(file);

        Wave wave = TestUtil.createValidWave();
        wave.setAttachment(savedFile);
        ResponseEntity<WaveViewModel> response = postWave(wave, WaveViewModel.class);

        Wave waveInDb = waveRepository.findById(response.getBody().getId()).get();

        assertThat(waveInDb.getAttachment().getId()).isEqualTo(savedFile.getId());
    }

    @Test
    public void postWave_whenWaveHasFileAttachmentAndUserIsAuthorized_receiveWaveVmWithAttachment() throws IOException {
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        MultipartFile file = createFile();
        FileAttachment savedFile = fileService.saveAttachment(file);

        Wave wave = TestUtil.createValidWave();
        wave.setAttachment(savedFile);
        ResponseEntity<WaveViewModel> response = postWave(wave, WaveViewModel.class);

        Wave waveInDb = waveRepository.findById(response.getBody().getId()).get();

        assertThat(response.getBody().getAttachment().getName()).isEqualTo(savedFile.getName());
    }

    @Test
    public void getWaves_whenThereAreNoWaves_receiveOk(){
        ResponseEntity<Object> response = getWaves(new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getWaves_whenThereAreNoWaves_receivePageWith0Items(){
        ResponseEntity<TestPage<Object>> response = getWaves(
                new ParameterizedTypeReference<TestPage<Object>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getWaves_whenThereAreWaves_receivePageWithItems(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<TestPage<Object>> response = getWaves(
                new ParameterizedTypeReference<TestPage<Object>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getWaves_whenThereAreWaves_receivePageWithWaveVM(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<TestPage<WaveViewModel>> response = getWaves(
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});
        WaveViewModel storedWave = response.getBody().getContent().get(0);

        assertThat(storedWave.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postWave_whenWaveIsValidAndUserIsAuthorized_receiveWaveVM(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        Wave wave = TestUtil.createValidWave();
        ResponseEntity<WaveViewModel> response = postWave(wave, WaveViewModel.class);

        assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getWavesOfUser_whenUserExists_receiveOK(){
        userService.save(TestUtil.createValidUser("user1"));

        ResponseEntity<Object> response = getWavesOfUser("user1",
                new ParameterizedTypeReference<Object>(){});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getWavesOfUser_whenUserDoesnExists_receiveNotFound(){
        ResponseEntity<Object> response = getWavesOfUser("unknown",
                new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getWavesOfUser_whenUserExists_receivePageWith0Waves(){
        userService.save(TestUtil.createValidUser("user1"));

        ResponseEntity<TestPage<Object>> response = getWavesOfUser("user1",
                new ParameterizedTypeReference<TestPage<Object>>(){});

        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getWavesOfUser_whenUserExistWithWaves_receivePageWithWaveVM(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        waveService.save(user, TestUtil.createValidWave());

        ResponseEntity<TestPage<WaveViewModel>> response = getWavesOfUser("user1",
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});
        WaveViewModel storedWave = response.getBody().getContent().get(0);

        assertThat(storedWave.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getWavesOfUser_whenUserExistWithMultipleWaves_receivePageWithMatchingWavesCount(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());

        ResponseEntity<TestPage<WaveViewModel>> response = getWavesOfUser("user1",
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getWavesOfUser_whenMultipleUserExistWithMultipleWaves_receivePageWithMatchingWavesCount(){
        User userWithThreeWaves = userService.save(TestUtil.createValidUser("user1"));
        IntStream.rangeClosed(1,3).forEach(i -> {
            waveService.save(userWithThreeWaves, TestUtil.createValidWave());
        });
        User userWithFiveWaves = userService.save(TestUtil.createValidUser("user2"));
        IntStream.rangeClosed(1, 5).forEach(i -> {
            waveService.save(userWithFiveWaves, TestUtil.createValidWave());
        });

        ResponseEntity<TestPage<WaveViewModel>> response = getWavesOfUser("user2",
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(5);
    }

    @Test
    public void getOldWaves_whenThereAreNoWaves_receiveOk(){
        ResponseEntity<Object> response = getOldWaves(5, new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldWaves_whenThereAreWaves_receivePageWithItemsProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<TestPage<Object>> response = getOldWaves(fourth.getId(),
                new ParameterizedTypeReference<TestPage<Object>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldWaves_whenThereAreWaves_receivePageWithWaveVMBeforeProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<TestPage<WaveViewModel>> response = getOldWaves(fourth.getId(),
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});

        assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
    }

    @Test
    public void getOldWavesOfUser_whenUserExistThereAreNoWaves_receiveOk(){
        userService.save(TestUtil.createValidUser("user1"));
        ResponseEntity<Object> response = getOldWavesOfUser(5, "user1",
                new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldWavesOfUser_whenUserExistAndThereAreWaves_receivePageWithItemsProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<TestPage<Object>> response = getOldWavesOfUser(
                fourth.getId(),
                user.getUsername(),
                new ParameterizedTypeReference<TestPage<Object>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldWavesOfUser_whenUserExistAndThereAreWaves_receivePageWithWaveVMBeforeProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<TestPage<WaveViewModel>> response = getOldWavesOfUser(
                fourth.getId(),
                user.getUsername(),
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});

        assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
    }

    @Test
    public void getOldWavesOfUser_whenUserDoesntExistThereAreNoWaves_receiveNotFound(){
        ResponseEntity<Object> response = getOldWavesOfUser(5, "user1",
                new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getOldWavesOfUser_whenUserExistAndThereAreNoWaves_receivePageWith0ItemsBeforeProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        userService.save(TestUtil.createValidUser("user2"));
        ResponseEntity<TestPage<WaveViewModel>> response = getOldWavesOfUser(
                fourth.getId(),
                "user2",
                new ParameterizedTypeReference<TestPage<WaveViewModel>>() {});

        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getNewWaves_whenThereAreWaves_receiveListOfItemsAfterProvidedId(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<List<Object>> response = getNewWaves(fourth.getId(),
                new ParameterizedTypeReference<List<Object>>() {});

        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewWaves_whenThereAreWaves_receiveListOfWaveVMAfterProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<List<WaveViewModel>> response = getNewWaves(fourth.getId(),
                new ParameterizedTypeReference<List<WaveViewModel>>() {});

        assertThat(response.getBody().get(0).getDate()).isGreaterThan(0);
    }

    @Test
    public void getNewWavesOfUser_whenUserExistThereAreNoWaves_receiveOk(){
        userService.save(TestUtil.createValidUser("user1"));
        ResponseEntity<Object> response = getNewWavesOfUser(5, "user1",
                new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getNewWavesOfUser_whenUserExistAndThereAreWaves_receiveListWithItemsAfterProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<List<Object>> response = getNewWavesOfUser(
                fourth.getId(),
                user.getUsername(),
                new ParameterizedTypeReference<List<Object>>() {});

        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewWavesOfUser_whenUserExistAndThereAreWaves_receiveListWithWaveVMAfterProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<List<WaveViewModel>> response = getNewWavesOfUser(
                fourth.getId(),
                user.getUsername(),
                new ParameterizedTypeReference<List<WaveViewModel>>() {});

        assertThat(response.getBody().get(0).getDate()).isGreaterThan(0);
    }

    @Test
    public void getNewWavesOfUser_whenUserDoesntExistThereAreNoWaves_receiveNotFound(){
        ResponseEntity<Object> response = getNewWavesOfUser(5, "user1",
                new ParameterizedTypeReference<Object>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getNewWavesOfUser_whenUserExistAndThereAreNoWaves_receiveListWith0ItemsAfterProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        userService.save(TestUtil.createValidUser("user2"));
        ResponseEntity<List<WaveViewModel>> response = getNewWavesOfUser(
                fourth.getId(),
                "user2",
                new ParameterizedTypeReference<List<WaveViewModel>>() {});

        assertThat(response.getBody().size()).isEqualTo(0);
    }

    @Test
    public void getNewWaveCount_whenThereAreWaves_receiveCountAfterProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<Map<String, Long>> response = getNewWaveCount(fourth.getId(),
                new ParameterizedTypeReference<Map<String,Long>>() {});

        assertThat(response.getBody().get("count")).isEqualTo(1);
    }

    @Test
    public void getNewWaveCountOfUser_whenThereAreWaves_receiveCountAfterProvidedId(){
        User user = TestUtil.createValidUser("user1");
        userService.save(user);
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        Wave fourth = waveService.save(user, TestUtil.createValidWave());
        waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<Map<String, Long>> response = getNewWaveCountOfUser(fourth.getId(),
                user.getUsername(),
                new ParameterizedTypeReference<Map<String,Long>>() {});

        assertThat(response.getBody().get("count")).isEqualTo(1);
    }

    @Test
    public void deleteWave_WhenUserIsUnauthorized_receiveUnauthorized(){
        ResponseEntity<Object> response = deleteWave(555, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void deleteWave_WhenUserIsAuthorized_receiveOk(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Wave wave = waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<Object> response = deleteWave(wave.getId(), Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void deleteWave_WhenUserIsAuthorized_receivegenericResponse(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Wave wave = waveService.save(user, TestUtil.createValidWave());
        ResponseEntity<GenericResponse> response = deleteWave(wave.getId(), GenericResponse.class);

        assertThat(response.getBody().getMessage()).isNotNull();
    }

    @Test
    public void deleteWave_WhenUserIsAuthorized_waveRemovedFromDb(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Wave wave = waveService.save(user, TestUtil.createValidWave());
        deleteWave(wave.getId(), Object.class);
        Optional<Wave> waveInDb = waveRepository.findById(wave.getId());

        assertThat(waveInDb.isPresent()).isFalse();
    }

    @Test
    public void deleteWave_WhenWaveIsOwnedByAnotherUser_receiveForbidden(){
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        User waveOwner = userService.save(TestUtil.createValidUser("wave-owner"));
        Wave wave = waveService.save(waveOwner, TestUtil.createValidWave());
        ResponseEntity<Object> response = deleteWave(wave.getId(), Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    public void deleteWave_WhenWaveIsntExist_receiveForbidden(){
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        ResponseEntity<Object> response = deleteWave(555, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    public void deleteWave_whenWaveHasAttachment_attachmentRemovedFromDb() throws IOException {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        MultipartFile file = createFile();
        FileAttachment savedFile = fileService.saveAttachment(file);

        Wave wave = TestUtil.createValidWave();
        wave.setAttachment(savedFile);
        ResponseEntity<WaveViewModel> response = postWave(wave, WaveViewModel.class);

        long waveId = response.getBody().getId();
        deleteWave(waveId, Object.class);

        Optional<FileAttachment> optionalAttachment = fileAttachmentRepository.findById(savedFile.getId());

        assertThat(optionalAttachment.isPresent()).isFalse();
    }

    @Test
    public void deleteWave_whenWaveHasAttachment_attachmentRemovedFromStorage() throws IOException {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");

        MultipartFile file = createFile();
        FileAttachment savedFile = fileService.saveAttachment(file);

        Wave wave = TestUtil.createValidWave();
        wave.setAttachment(savedFile);
        ResponseEntity<WaveViewModel> response = postWave(wave, WaveViewModel.class);

        long waveId = response.getBody().getId();
        deleteWave(waveId, Object.class);
        String attachmentFolderPath = appConfiguration.getFullAttachmentsPath() + "/" + savedFile.getName();
        File storedImage = new File(attachmentFolderPath);

        assertThat(storedImage.exists()).isFalse();
    }

    private void authenticate(String username) {
        testRestTemplate.
                getRestTemplate().
                getInterceptors().
                add(new BasicAuthenticationInterceptor(username,"P4ssword"));
    }

    private <T> ResponseEntity<T> postWave(Wave wave, Class<T> responseType){
        return testRestTemplate.postForEntity(API_1_0_WAVES, wave, responseType);
    }

    public <T> ResponseEntity<T> getWaves(ParameterizedTypeReference<T> responseType){
        return testRestTemplate.exchange(API_1_0_WAVES, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getWavesOfUser(String username, ParameterizedTypeReference<T> responseType){
        String path = "/api/1.0/users/" + username + "/waves";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getOldWaves(long waveId, ParameterizedTypeReference<T> responseType){
        String path = API_1_0_WAVES + "/" + waveId + "?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getOldWavesOfUser(long waveId, String username, ParameterizedTypeReference<T> responseType){
        String path = "/api/1.0/users/" + username + "/waves/" + waveId + "?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewWaves(long waveId, ParameterizedTypeReference<T> responseType){
        String path = API_1_0_WAVES + "/" + waveId + "?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewWavesOfUser(long waveId, String username, ParameterizedTypeReference<T> responseType){
        String path = "/api/1.0/users/" + username + "/waves/" + waveId + "?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewWaveCount(long waveId, ParameterizedTypeReference<T> responseType){
        String path = API_1_0_WAVES + "/" + waveId + "?direction=after&count=true";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewWaveCountOfUser(long waveId, String username, ParameterizedTypeReference<T> responseType){
        String path = "/api/1.0/users/" + username + "/waves/" + waveId + "?direction=after&count=true";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> deleteWave(long waveId, Class<T> responseType){
        return testRestTemplate.exchange(API_1_0_WAVES + "/" + waveId, HttpMethod.DELETE, null, responseType);
    }
}
