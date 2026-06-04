package com.philosophy.rag.controller;


import com.philosophy.rag.entity.Slogan;
import com.philosophy.rag.service.SloganService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/slogan")
@RequiredArgsConstructor
public class SloganController {

    private final SloganService sloganService;

    @GetMapping("/content")
    public String getSloganContent() {
        return sloganService.getRandomSlogan().getContent();
    }

    @GetMapping("/author")
    public String getSloganAuthor() {
        return sloganService.getRandomSlogan().getAuthor();
    }

    @PostMapping("")
    public void addSlogan(@RequestBody Slogan slogan) {
        sloganService.addSlogan(slogan);
    }
}
