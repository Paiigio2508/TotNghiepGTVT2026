package com.example.backend.repository;

import com.example.backend.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecializationRepository extends JpaRepository<Specialization, String> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, String id);
    List<Specialization> findByIdIn(List<String> ids);
}
