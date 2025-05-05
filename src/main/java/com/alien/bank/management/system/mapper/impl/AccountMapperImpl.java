package com.alien.bank.management.system.mapper.impl;

import org.springframework.stereotype.Component;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.mapper.AccountMapper;
import com.alien.bank.management.system.model.account.AccountResponseModel;

@Component
public class AccountMapperImpl implements AccountMapper {
    @Override
    public AccountResponseModel toResponseModel(Account account) {
        return AccountResponseModel
                .builder()
                .card_number(account.getCardNumber())
                .cvv(account.getCvv())
                .balance(account.getBalance())
                .created_at(account.getCreatedAt())
                .build();
    }
}