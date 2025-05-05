package com.alien.bank.management.system.model.account;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponseModel {
    private String card_number;
    private String cvv;
    private Double balance;
    private Date created_at;
}
