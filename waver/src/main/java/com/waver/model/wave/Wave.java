package com.waver.model.wave;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.waver.model.file.FileAttachment;
import com.waver.model.user.User;
import lombok.Data;

import javax.persistence.*;
import javax.sql.RowSet;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;

@Data
@Entity
public class Wave {

    @Id
    @GeneratedValue
    private long id;

    @NotNull
    @Size(min = 10, max = 5000)
    @Column(length = 5000)
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    @ManyToOne
    private User user;

    @OneToOne(mappedBy = "wave", orphanRemoval = true)
    private FileAttachment attachment;
}
