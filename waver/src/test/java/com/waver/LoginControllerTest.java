package com.waver;

import com.waver.error.ApiError;
import com.waver.model.TestUtil;
import com.waver.model.user.User;
import com.waver.model.user.UserRepository;
import com.waver.services.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {

    private static final String API_1_0_LOGIN = "/api/1.0/login";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @Before
    public void cleanUp(){
        userRepository.deleteAll();
        RestTemplate restTemplate = testRestTemplate.getRestTemplate();
        List<ClientHttpRequestInterceptor> interceptors = restTemplate.getInterceptors();
        interceptors.clear();
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveUnautorized(){
        ResponseEntity<Object> response = login(Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withIncorrectUserCredentials_receiveUnautorized(){
        authenticate();
        ResponseEntity<Object> response = login(Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiError(){
        ResponseEntity<ApiError> response = login(ApiError.class);

        assertThat(response.getBody().getUrl()).isEqualTo(API_1_0_LOGIN);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiErrorWithoutValidationErrors(){
        ResponseEntity<String> response = login(String.class);

        assertThat(response.getBody().contains("validationErrors")).isFalse();
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveUnautorizeWithoutWWWAuthenticationHeader(){
        authenticate();
        ResponseEntity<String> response = login(String.class);

        assertThat(response.getHeaders().containsKey("WWW-Authenticate")).isFalse();
    }

    @Test
    public void postLogin_withValidUserCredentials_receiveOK(){
        userService.save(TestUtil.createValidUser());

        authenticate();
        ResponseEntity<Object> response = login(Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postLogin_withValidUserCredentials_receiveLoggedUserId(){
        User userInDB = userService.save(TestUtil.createValidUser());

        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        Map<String, Object> body = response.getBody();
        Integer id = (Integer) body.get("id");

        assertThat(id).isEqualTo(userInDB.getId());
    }

    @Test
    public void postLogin_withValidUserCredentials_receiveLoggedUsersImage(){
        User userInDB = userService.save(TestUtil.createValidUser());

        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        Map<String, Object> body = response.getBody();
        String image = (String) body.get("image");

        assertThat(image).isEqualTo(userInDB.getImage());
    }

    @Test
    public void postLogin_withValidUserCredentials_receiveLoggedUsersDisplayName(){
        User userInDB = userService.save(TestUtil.createValidUser());

        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        Map<String, Object> body = response.getBody();
        String displayName = (String) body.get("displayName");

        assertThat(displayName).isEqualTo(userInDB.getDisplayName());
    }

    @Test
    public void postLogin_withValidUserCredentials_receiveLoggedUsersUsername(){
        User userInDB = userService.save(TestUtil.createValidUser());

        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        Map<String, Object> body = response.getBody();
        String username = (String) body.get("username");

        assertThat(username).isEqualTo(userInDB.getUsername());
    }

    @Test
    public void postLogin_withValidUserCredentials_notReceiveLoggedUsersPassword(){
        User userInDB = userService.save(TestUtil.createValidUser());

        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        Map<String, Object> body = response.getBody();

        assertThat(body.containsKey("password")).isFalse();
    }

    private void authenticate() {
        testRestTemplate.
                getRestTemplate().
                getInterceptors().
                add(new BasicAuthenticationInterceptor("test-user","P4ssword"));
    }

    public <T> ResponseEntity<T> login(Class<T> responseType){
        return testRestTemplate.postForEntity(API_1_0_LOGIN, null, responseType);
    }

    public <T> ResponseEntity<T> login(ParameterizedTypeReference<T> responseType){
        return testRestTemplate.exchange(API_1_0_LOGIN, HttpMethod.POST,null, responseType);
    }
}
