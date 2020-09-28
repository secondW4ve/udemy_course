package com.waver.controller;

import com.waver.model.file.FileAttachment;
import com.waver.services.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.UUID;

@RestController
@RequestMapping("/api/1.0")
public class FileUploadController {

    @Autowired
    FileService fileService;

    @PostMapping("/waves/upload")
    FileAttachment uploadForWave(MultipartFile file){
        return fileService.saveAttachment(file);
    }
}
