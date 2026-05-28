package com.philosophy.rag.base.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Profile("prod")
@Configuration
public class AwsS3Config {

    @Value("${aws.region}")
    private String awsRegion;

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        if (accessKeyId != null && secretAccessKey != null) {
            return S3Client.builder()
                    .region(Region.of(awsRegion))
                    .credentialsProvider(
                            StaticCredentialsProvider.create(
                                    AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                            )
                    )
                    .build();
        }

        return S3Client.builder()
                .region(Region.of(awsRegion))
                .build();
    }
}