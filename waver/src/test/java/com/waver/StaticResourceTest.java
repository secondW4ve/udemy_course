package com.waver;

import com.waver.configuration.AppConfiguration;
import org.apache.commons.io.FileUtils;
import org.aspectj.util.FileUtil;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.io.File;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class StaticResourceTest {

    @Autowired
    AppConfiguration appConfiguration;

    @Autowired
    MockMvc mockMvc;

    @Test
    public void checkStaticFolder_whenAppIsInitialized_uploadFolderMustExist(){
        File uploadFolder = new File(appConfiguration.getUploadPath());
        boolean uploadFolderExist = uploadFolder.exists() && uploadFolder.isDirectory();

        assertThat(uploadFolderExist).isTrue();
    }

    @Test
    public void checkStaticFolder_whenAppIsInitialized_prodileImageSubFoldersMustExist(){
        String profileImageFolderPath = appConfiguration.getFullProfileImagesPath();

        File profileImageFolder = new File(profileImageFolderPath);
        boolean profileImageFolderExist = profileImageFolder.exists() && profileImageFolder.isDirectory();

        assertThat(profileImageFolderExist).isTrue();
    }

    @Test
    public void checkStaticFolder_whenAppIsInitialized_attachmentsSubFolderMustExist(){
        String attachmentsFolderPath = appConfiguration.getFullAttachmentsPath();

        File attachmentsFolder = new File(attachmentsFolderPath);
        boolean attachmentsFolderExist = attachmentsFolder.exists() && attachmentsFolder.isDirectory();

        assertThat(attachmentsFolderExist).isTrue();
    }

    @Test
    public void getStaticFile_whenImageExistInProfileUploadFolder_receiveOK() throws Exception {
        String fileName = "profile-picture.png";
        File source = new ClassPathResource("profile.png").getFile();

        File target = new File(appConfiguration.getFullProfileImagesPath() + "/" + fileName);
        FileUtil.copyFile(source,target);
        mockMvc.perform(get("/images/" + appConfiguration.getProfileImagesFolder() + "/" + fileName))
                .andExpect(status().isOk());

    }

    @Test
    public void getStaticFile_whenImageExistInAttachmentFolder_receiveOK() throws Exception {
        String fileName = "profile-picture.png";
        File source = new ClassPathResource("profile.png").getFile();

        File target = new File(appConfiguration.getFullAttachmentsPath() + "/" + fileName);
        FileUtil.copyFile(source,target);
        mockMvc.perform(get("/images/" + appConfiguration.getAttachmentsFolder() + "/" + fileName))
                .andExpect(status().isOk());

    }

    @Test
    public void getStaticFile_whenImageDoesntExist_receiveNotFound() throws Exception {
        mockMvc.perform(get("/images" + appConfiguration.getAttachmentsFolder() + "/nonexistingimage.png"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void getStaticFile_whenImageExistInAttachmentFolder_receiveOKWithCacheHeaders() throws Exception {
        String fileName = "profile-picture.png";
        File source = new ClassPathResource("profile.png").getFile();

        File target = new File(appConfiguration.getFullAttachmentsPath() + "/" + fileName);
        FileUtil.copyFile(source,target);
        MvcResult result = mockMvc.perform(get("/images/" + appConfiguration.getAttachmentsFolder() + "/" + fileName))
                .andExpect(status().isOk())
                .andReturn();
        String cacheHeader = result.getResponse().getHeader("Cache-control").toString();
        assertThat(cacheHeader).containsIgnoringCase("max-age=31536000");

    }

    @After
    public void cleanUp() throws IOException {
        FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
        FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
    }
}
