package com.waver.model.user.viewmodel;


import com.waver.model.user.annotation.ProfileImage;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
public class UserUpdateViewModel {

    @NotNull
    @Size(min = 4, max = 255)
    private String displayName;

    @ProfileImage
    private String image;
}
