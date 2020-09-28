package com.waver.services;

import com.waver.model.user.User;
import com.waver.model.wave.Wave;
import com.waver.model.wave.WaveRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class WaveSecurityService {

     WaveRepository waveRepository;

    public WaveSecurityService(WaveRepository waveRepository) {
        this.waveRepository = waveRepository;
    }

    public boolean isAllowedToDelete(long waveId, User loggedInUser){
        Optional<Wave> optionalWave = waveRepository.findById(waveId);
        if(optionalWave.isPresent()){
            Wave waveInDb = optionalWave.get();
            return waveInDb.getUser().getId() == loggedInUser.getId();
        }
        return false;
    }
}
