package com.dataintelligence.repository;

import com.dataintelligence.model.IntelligenceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<IntelligenceTask, String> {
    List<IntelligenceTask> findAllByOrderByCreatedAtDesc();
}
