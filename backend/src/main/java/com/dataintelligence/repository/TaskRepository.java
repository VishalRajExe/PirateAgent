package com.dataintelligence.repository;

import com.dataintelligence.model.IntelligenceTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<IntelligenceTask, String> {

    // All tasks ordered by date
    List<IntelligenceTask> findAllByOrderByCreatedAtDesc();

    // Tasks for a specific user ordered by date
    List<IntelligenceTask> findByUserIdOrderByCreatedAtDesc(String userId);

    // Single task isolated by user
    Optional<IntelligenceTask> findByIdAndUserId(String id, String userId);

    // Paginated + filtered by status and search with optional user isolation
    @Query("SELECT t FROM IntelligenceTask t WHERE " +
           "(:userId IS NULL OR :userId = '' OR t.userId = :userId) AND " +
           "(:status IS NULL OR :status = '' OR t.status = :status) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(t.userPrompt) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY t.createdAt DESC")
    Page<IntelligenceTask> findFilteredWithUser(
            @Param("userId") String userId,
            @Param("status") String status,
            @Param("query") String query,
            Pageable pageable);

    // Paginated + filtered without user constraint
    @Query("SELECT t FROM IntelligenceTask t WHERE " +
           "(:status IS NULL OR :status = '' OR t.status = :status) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(t.userPrompt) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY t.createdAt DESC")
    Page<IntelligenceTask> findFiltered(
            @Param("status") String status,
            @Param("query") String query,
            Pageable pageable);
}
