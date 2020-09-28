package com.waver;

import com.waver.model.TestUtil;
import com.waver.model.file.FileAttachment;
import com.waver.model.file.FileAttachmentRepository;
import com.waver.model.wave.Wave;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
public class FileAttachmentRepositoryTest {

    @Autowired
    TestEntityManager testEntityManager;

    @Autowired
    FileAttachmentRepository fileAttachmentRepository;

    @Test
    public void findByDateBeforeAndWaveIsNull_whenAttachmentsDateOlderThan1Hour_returnsAll(){
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getOneHourOldFileAttachment());
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));

        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndWaveIsNull(oneHourAgo);

        assertThat(attachments.size()).isEqualTo(3);
    }

    @Test
    public void findByDateBeforeAndWaveIsNull_whenAttachmentsDateOlderThan1HourButHaveWave_returnsNone(){
        Wave wave1 = testEntityManager.persist(TestUtil.createValidWave());
        Wave wave2 = testEntityManager.persist(TestUtil.createValidWave());
        Wave wave3 = testEntityManager.persist(TestUtil.createValidWave());

        testEntityManager.persist(getOldFileAttachmentsWithWave(wave1));
        testEntityManager.persist(getOldFileAttachmentsWithWave(wave2));
        testEntityManager.persist(getOldFileAttachmentsWithWave(wave3));
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));

        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndWaveIsNull(oneHourAgo);

        assertThat(attachments.size()).isEqualTo(0);
    }

    @Test
    public void findByDateBeforeAndWaveIsNull_whenAttachmentsDateWithin1Hour_returnsNone(){
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));

        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndWaveIsNull(oneHourAgo);

        assertThat(attachments.size()).isEqualTo(0);
    }

    @Test
    public void findByDateBeforeAndWaveIsNull_whenSomeAttachmentsSomeNewAndSomeWithWaves_returnsAttachmentsWithOlderAndNoWave(){
        Wave wave1 = testEntityManager.persist(TestUtil.createValidWave());
        testEntityManager.persist(getOldFileAttachmentsWithWave(wave1));
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));

        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndWaveIsNull(oneHourAgo);

        assertThat(attachments.size()).isEqualTo(1);
    }

    private FileAttachment getOneHourOldFileAttachment(){
        Date date = new Date(System.currentTimeMillis() - (60*60*1000) - 1);
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(date);
        return fileAttachment;
    }

    private FileAttachment getOldFileAttachmentsWithWave(Wave wave){
        FileAttachment fileAttachment = getOneHourOldFileAttachment();
        fileAttachment.setWave(wave);
        return fileAttachment;
    }

    private FileAttachment getFileAttachmentWithinOneHour(){
        Date date = new Date(System.currentTimeMillis() - (60*1000) - 1);
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(date);
        return fileAttachment;
    }
}
