package com.example.backend.scheduler;

import com.example.backend.entity.InternshipTerm;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.util.status.TermStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class InternshipTermScheduler {

    private final InternshipTermRepository repository;

    public InternshipTermScheduler(InternshipTermRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 0 * * ?")
//    @Scheduled(fixedRate = 10000)
    public void updateTermStatus() {

        LocalDate today = LocalDate.now();
        List<InternshipTerm> terms = repository.findAll();

        for (InternshipTerm term : terms) {

            TermStatus newStatus;

            if (today.isBefore(term.getStartDate())) {
                newStatus = TermStatus.SAP_DIEN_RA;
            } else if (!today.isAfter(term.getEndDate())) {
                newStatus = TermStatus.DANG_DIEN_RA;
            } else {
                newStatus = TermStatus.KET_THUC;
            }

            if (!term.getStatus().equals(newStatus)) {
                term.setStatus(newStatus);
                repository.save(term);
            }
        }
    }
}