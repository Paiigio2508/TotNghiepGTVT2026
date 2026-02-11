package com.example.backend.repository;

import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.InternshipTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipTermRepository extends JpaRepository<InternshipTerm, String> {
    @Query(value = """
          SELECT id,name,academic_year as year, description,start_date as startDate, end_date as endDate ,
           status,created_at as createdAt FROM internship_terms;
            """, nativeQuery = true)
    List<InternshipTermResponse> getALL();
}
