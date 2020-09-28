package com.waver;

import com.waver.model.user.User;
import com.waver.model.wave.Wave;
import com.waver.services.UserService;
import com.waver.services.WaveService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import java.util.*;
import java.util.stream.IntStream;

@SpringBootApplication
public class WaverApplication {

	public static void main(String[] args) {
		SpringApplication.run(WaverApplication.class, args);
	}

	@Bean
	@Profile("dev")
	CommandLineRunner run(UserService userService, WaveService waveService) {
		return args -> {
			IntStream.rangeClosed(1, 15)
					.mapToObj(i -> {
						User user = new User();
						user.setDisplayName("display-name-" + i);
						user.setUsername("user-" + i);
						user.setPassword("P4ssword");
						return user;
					})
					.forEach(user -> userService.save(user));
			Wave wave = new Wave();
			wave.setContent("Test wave content");
			wave.setTimestamp(new Date());
			waveService.save(userService.getByUsername("user-1"), wave);
		};
	}

}



