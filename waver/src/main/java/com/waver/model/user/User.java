package com.waver.model.user;

import com.waver.model.user.annotation.UniqueUsername;
import com.waver.model.wave.Wave;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.beans.Transient;
import java.util.Collection;
import java.util.List;

@Data
@Entity
public class User implements UserDetails {

    @Id
    @GeneratedValue
    private long id;

    @NotNull(message = "{waver.constraints.username.NotNull.message}")
    @Size (min = 4, max = 255)
    @UniqueUsername
    private String username;

    @NotNull
    @Size (min = 4, max = 255)
    private String displayName;

    @NotNull
    @Size (min = 8, max = 255)
    //Example: P4ssword
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "{waver.constraints.password.Pattern.message}")
    private String password;

    private String image;

    @OneToMany(mappedBy = "user")
    private List<Wave> waves;

    @Override
    @Transient
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return AuthorityUtils.createAuthorityList("Role_USER");
    }

    @Override
    @Transient
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @Transient
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @Transient
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @Transient
    public boolean isEnabled() {
        return true;
    }
}