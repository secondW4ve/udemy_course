package com.waver.model.wave;

import com.waver.model.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;


public interface WaveRepository extends JpaRepository<Wave, Long>, JpaSpecificationExecutor<Wave> {

    Page<Wave> findByUser(User user, Pageable pageable);
}
