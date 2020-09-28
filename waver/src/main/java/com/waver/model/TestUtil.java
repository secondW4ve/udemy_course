package com.waver.model;

import com.waver.model.user.User;
import com.waver.model.wave.Wave;

public class TestUtil {

    public static User createValidUser() {
        User user = new User();
        user.setUsername("test-user");
        user.setDisplayName("test-displayName");
        user.setPassword("P4ssword");
        user.setImage("profile-image.png");
        return user;
    }

    public static User createValidUser(String username) {
        User user = createValidUser();
        user.setUsername(username);
        return user;
    }

    public static Wave createValidWave(){
        Wave wave = new Wave();
        wave.setContent("Test wave content");
        return wave;
    }

}
