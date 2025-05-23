package com.alien.bank.management.system.service.impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.User;
import com.alien.bank.management.system.mapper.AccountMapper;
import com.alien.bank.management.system.model.account.AccountResponseModel;
import com.alien.bank.management.system.repository.AccountRepository;
import com.alien.bank.management.system.repository.UserRepository;
import com.alien.bank.management.system.service.AccountService;
import com.alien.bank.management.system.utils.Utils;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    @Override
    public AccountResponseModel createNewAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User " + email + " Not Found"));

        Account account = accountRepository.save(
            Account
                .builder()
                .cardNumber(generateUniqueCardNumber())
                .cvv(Utils.generateCVV())
                .balance(0.0)
                .user(user)
                .build()
        );

        return accountMapper.toResponseModel(account);
    }

    @Override
    public List<AccountResponseModel> getMyAccounts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User " + email + " Not Found"));

//                 List<Account> accounts = accountRepository.findAllByUser(user);
// for (Account account : accounts) {
//     System.out.println("Account ID: " + account.getId() + ", createdAt: " + account.getCreatedAt());
// }
        return accountRepository
                .findAllByUser(user)
                .stream()
                .map(accountMapper::toResponseModel)
                .toList();
    }

    public String generateUniqueCardNumber() {
        String cardNumber = Utils.generateCardNumber();

        while (accountRepository.existsByCardNumber(cardNumber)) {
            cardNumber = Utils.generateCardNumber();
        }

        return cardNumber;
    }
}