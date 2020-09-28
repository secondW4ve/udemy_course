package com.waver;

import com.waver.model.TestUtil;
import com.waver.model.user.User;
import com.waver.model.user.UserRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    TestEntityManager testEntityManager;

    @Autowired
    UserRepository userRepository;

    @Test
    public void findByUsername_whenUserExist_returnUser(){
        testEntityManager.persist(TestUtil.createValidUser());

        User userFromDb = userRepository.findByUsername("test-user");
        assertThat(userFromDb).isNotNull();
    }

    @Test
    public void findByUsername_whenUserDoesntExist_returnNull(){
        User userFromDb = userRepository.findByUsername("test-name");
        assertThat(userFromDb).isNull();
    }
}
