package com.waver.services;

import com.waver.model.file.FileAttachment;
import com.waver.model.file.FileAttachmentRepository;
import com.waver.model.user.User;
import com.waver.model.wave.Wave;
import com.waver.model.wave.WaveRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Date;
import java.util.List;

@Service
public class WaveService {

    WaveRepository waveRepository;

    UserService userService;

    FileAttachmentRepository fileAttachmentRepository;

    FileService fileService;

    public WaveService(
            WaveRepository waveRepository,
            UserService userService,
            FileAttachmentRepository fileAttachmentRepository,
            FileService fileService) {
        this.waveRepository = waveRepository;
        this.userService = userService;
        this.fileAttachmentRepository = fileAttachmentRepository;
        this.fileService = fileService;
    }

    public Wave save(User user, Wave wave){
        wave.setTimestamp(new Date());
        wave.setUser(user);
        if(wave.getAttachment() != null){
            FileAttachment fileAttachmentInDb = fileAttachmentRepository.findById(wave.getAttachment().getId()).get();
            fileAttachmentInDb.setWave(wave);
            wave.setAttachment(fileAttachmentInDb);
        }
        return waveRepository.save(wave);
    }

    public Page<Wave> getAllWaves(Pageable pageable) {
        return waveRepository.findAll(pageable);
    }

    public Page<Wave> getWavesOfUser(String username, Pageable pageable) {
        User userInDb = userService.getByUsername(username);
        return waveRepository.findByUser(userInDb, pageable);
    }

    public Page<Wave> getOldWaves(long id, String username, Pageable pageable) {
        Specification<Wave> spec = Specification.where(idLessThan(id));
        if (username != null){
            User userInDb = userService.getByUsername(username);
            spec = spec.and(userIs(userInDb));
        }
        return waveRepository.findAll(spec, pageable);
    }

    public List<Wave> getNewWaves(long id, String username, Pageable pageable) {
        Specification<Wave> spec = Specification.where(idGreaterThan(id));
        if (username != null){
            User userInDb = userService.getByUsername(username);
            spec = spec.and(userIs(userInDb));
        }
        return waveRepository.findAll(spec, pageable.getSort());
    }

    public long getNewWavesCount(long id, String username) {
        Specification<Wave> spec = Specification.where(idGreaterThan(id));
        if (username != null){
            User userInDb = userService.getByUsername(username);
            spec = spec.and(userIs(userInDb));
        }
        return waveRepository.count(spec);
    }

    private Specification<Wave> userIs(User user){
        return (root, criteriaQuery, criteriaBuilder) -> {
            return criteriaBuilder.equal(root.get("user"), user);
        };
    }

    private Specification<Wave> idLessThan(long id){
        return(root, query, criteriaBuilder) -> {
            return criteriaBuilder.lessThan(root.get("id"), id);
        };
    }

    private Specification<Wave> idGreaterThan(long id){
        return(root, query, criteriaBuilder) -> {
            return criteriaBuilder.greaterThan(root.get("id"), id);
        };
    }

    public void deleteWave(long id) {
        Wave wave = waveRepository.getOne(id);
        if (wave.getAttachment() != null){
            fileService.deleteAttachmentImage(wave.getAttachment().getName());
        }
        waveRepository.deleteById(id);
    }
}
