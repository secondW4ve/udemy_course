package com.waver.model.user.annotation.validators;

import com.waver.model.user.User;
import com.waver.model.user.UserRepository;
import com.waver.model.user.annotation.UniqueUsername;
import org.springframework.beans.factory.annotation.Autowired;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class UniqueUsernameValidator implements ConstraintValidator <UniqueUsername, String> {

    @Autowired
    UserRepository userRepository;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext constraintValidatorContext) {
        User userFromDb = userRepository.findByUsername(value);
        if (userFromDb == null){
            return true;
        }
        return false;
    }
}
