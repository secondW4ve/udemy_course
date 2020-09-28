package com.waver.model.wave;

import com.waver.model.file.FileAttachment;
import com.waver.model.file.FileAttachmentVM;
import com.waver.model.user.viewmodel.UserViewModel;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WaveViewModel {

    private long id;

    private String content;

    private long date;

    private UserViewModel user;

    private FileAttachmentVM attachment;

    public WaveViewModel(Wave wave){
        this.id = wave.getId();
        this.content = wave.getContent();
        this.setDate(wave.getTimestamp().getTime());
        this.setUser(new UserViewModel(wave.getUser()));
        if(wave.getAttachment() != null){
            this.setAttachment(new FileAttachmentVM(wave.getAttachment()));
        }
    }
}
