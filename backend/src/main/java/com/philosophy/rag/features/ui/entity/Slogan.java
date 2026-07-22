package com.philosophy.rag.features.ui.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "slogans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slogan  extends BaseEntity {

    @Id
    @Column(name = "slogan_id", nullable = false, updatable = false)
    private UUID sloganId;

    @PrePersist
    public void generateId() {
        if (sloganId == null) {
            sloganId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "author", nullable = false)
    private String author;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;


}
