package com.dataintelligence.repository;

import com.dataintelligence.model.SourceCitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SourceCitationRepository extends JpaRepository<SourceCitation, Long> {
    List<SourceCitation> findByDatasetId(String datasetId);
}
