package com.alien.bank.management.system.entity;

import java.sql.Date;

import org.hibernate.annotations.CreationTimestamp; // Hibernateのアノテーション

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String cardNumber;

    @Column(nullable = false)
    private String cvv;

    @Column(nullable = false)
    private Double balance;

     // ↓↓↓ この部分です ↓↓↓
     @CreationTimestamp // エンティティ永続化時に自動で日時を設定
     @Column(nullable = false, updatable = false) // NULL不可、更新不可
     private Date createdAt; // ★ Date型の createdAt フィールド
     // ↑↑↑ この部分です ↑↑↑
     
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
