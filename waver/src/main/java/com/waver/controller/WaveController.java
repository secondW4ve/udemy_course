package com.waver.controller;

import com.waver.model.user.User;
import com.waver.model.wave.Wave;
import com.waver.model.wave.WaveViewModel;
import com.waver.services.WaveService;
import com.waver.shared.CurrentUser;
import com.waver.shared.GenericResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.AccessType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/1.0")
public class WaveController {

    @Autowired
    WaveService waveService;

    @PostMapping("/waves")
    WaveViewModel generateWave(@Valid @RequestBody Wave wave, @CurrentUser User user){
        return new WaveViewModel(waveService.save(user, wave));
    }

    @GetMapping("/waves")
    Page<WaveViewModel> getAllWaves(Pageable pageable){
        return waveService.getAllWaves(pageable).map(WaveViewModel::new);
    }

    @GetMapping("/users/{username}/waves")
    Page<WaveViewModel> getWavesOfUser(@PathVariable String username, Pageable pageable){
        return waveService.getWavesOfUser(username, pageable).map(WaveViewModel::new);
    }

    @GetMapping({"/waves/{id:[0-9]+}", "/users/{username}/waves/{id:[0-9]+}"})
    ResponseEntity<?> getWavesRelative(
            @PathVariable long id,
            @PathVariable(required = false) String username,
            Pageable pageable,
            @RequestParam(name = "direction", defaultValue = "after") String direction,
            @RequestParam(name = "count", defaultValue = "false", required = false) boolean count){
        if (!direction.equalsIgnoreCase("after")){
            return ResponseEntity.ok(waveService.getOldWaves(id, username, pageable).map(WaveViewModel::new));
        }
        if (count){
            long newWaveCount = waveService.getNewWavesCount(id, username);
            return ResponseEntity.ok(Collections.singletonMap("count", newWaveCount));
        }
        List<WaveViewModel> newWaves = waveService.getNewWaves(id, username, pageable)
                .stream().map(WaveViewModel::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(newWaves);
    }

    @DeleteMapping("/waves/{id:[0-9]+}")
    @PreAuthorize("@waveSecurityService.isAllowedToDelete(#id, principal)")
    GenericResponse deleteWave(@PathVariable long id){
        waveService.deleteWave(id);
        return new GenericResponse("Wave is removed");
    }
}
