package com.waver.controller;

import com.waver.error.ApiError;
import com.waver.exception.CustomNotFoundException;
import com.waver.model.user.User;
import com.waver.model.user.viewmodel.UserUpdateViewModel;
import com.waver.model.user.viewmodel.UserViewModel;
import com.waver.services.UserService;
import com.waver.shared.CurrentUser;
import com.waver.shared.GenericResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/1.0")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping(path = "/users", consumes = "application/json")
    GenericResponse createUser(@Valid @RequestBody User user){
        userService.save(user);
        return new GenericResponse("User saved");
    }

    @GetMapping("/users")
    Page<UserViewModel> getUsers(@CurrentUser User loggedInUser, Pageable page){
        return userService.getUsers(loggedInUser, page)
                .map((user) -> new UserViewModel(user));
    }

    @GetMapping("/users/{username}")
    UserViewModel getUserByName(@PathVariable String username){
        User user = userService.getByUsername(username);
        return new UserViewModel(user);
    }

    @PutMapping("/users/{id:[0-9]+}")
    @PreAuthorize("#id == principal.id")
    UserViewModel updateUser(@PathVariable long id, @Valid @RequestBody(required = false) UserUpdateViewModel userUpdate){
        User updatedUser = userService.update(id, userUpdate);
        return new UserViewModel(updatedUser);
    }
}
