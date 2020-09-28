package com.waver.controller;

import com.waver.model.user.User;
import com.waver.model.user.viewmodel.UserViewModel;
import com.waver.shared.CurrentUser;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @PostMapping("/api/1.0/login")
    UserViewModel handleLogin(@CurrentUser User loggedInUser){

        return new UserViewModel(loggedInUser);
    }


}
