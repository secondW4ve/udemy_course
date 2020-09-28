package com.waver.services;

import com.waver.exception.CustomNotFoundException;
import com.waver.model.user.User;
import com.waver.model.user.UserRepository;
import com.waver.model.user.viewmodel.UserUpdateViewModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

@Service
public class UserService {

    UserRepository userRepository;

    PasswordEncoder passwordEncoder;

    FileService fileService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, FileService fileService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileService = fileService;
    }

    public User save(User user){
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    public Page<User> getUsers(User loggedInUser, Pageable page) {
        if (loggedInUser != null){
            return userRepository.findByUsernameNot(loggedInUser.getUsername(), page);
        }
        return userRepository.findAll(page);
    }

    public User getByUsername(String username) throws CustomNotFoundException{
        User user = userRepository.findByUsername(username);
        if (user == null){
            throw new CustomNotFoundException("User with this username:{username} not found");
        }
        return user;
    }

    public User update(long id, UserUpdateViewModel userUpdate) {
        User userInDB = userRepository.getOne(id);
        userInDB.setDisplayName(userUpdate.getDisplayName());
        if (userUpdate.getImage() != null){
            String savedImageName = null;
            try {
                savedImageName = fileService.saveProfileImage(userUpdate.getImage());
                fileService.deleteProfileImage(userInDB.getImage());
                userInDB.setImage(savedImageName);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return userRepository.save(userInDB);
    }
}
