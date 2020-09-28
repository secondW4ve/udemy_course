package com.waver.model.user.viewmodel;

import com.waver.model.user.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserViewModel {

    private long id;
    private String username;
    private String displayName;
    private String image;

    public UserViewModel(User user){
        this.setId(user.getId());
        this.setUsername(user.getUsername());
        this.setDisplayName(user.getDisplayName());
        this.setImage(user.getImage());
    }
}
