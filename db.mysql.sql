CREATE TABLE Business (
    Id BIGINT NOT NULL PRIMARY KEY,
    Code VARCHAR(500) UNIQUE,
    Name VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DeletedAt DATETIME
);
CREATE UNIQUE INDEX Business_pk2 ON Business (Code);
CREATE INDEX Business_Id_Code_Name_index ON Business (Id, Code, Name);
CREATE TABLE Company (
    Id BIGINT NOT NULL PRIMARY KEY,
    TaxCode VARCHAR(500) UNIQUE,
    Name VARCHAR(500),
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DeletedAt DATETIME,
    Representative VARCHAR(500),
    MainBusiness VARCHAR(500),
    Address VARCHAR(500),
    IssuedAt DATETIME,
    CurrentStatus VARCHAR(500),
    AlternateName VARCHAR(500),
    ProvinceId BIGINT,
    DistrictId BIGINT,
    MainBusinessId BIGINT,
    Slug VARCHAR(2048),
    WardId BIGINT,
    FormattedAddress TEXT,
    ProvinceName VARCHAR(255),
    DistrictName VARCHAR(255),
    WardName VARCHAR(255),
    IsCrawledFull BOOLEAN
);
CREATE UNIQUE INDEX Company_pk2 ON Company (TaxCode);
CREATE INDEX Company_Id_TaxCode_Name_index ON Company (Id, TaxCode, Name);
CREATE TABLE CompanyBusinessMapping (
    BusinessId BIGINT NOT NULL,
    CompanyId BIGINT NOT NULL,
    PRIMARY KEY (BusinessId, CompanyId),
    FOREIGN KEY (CompanyId) REFERENCES Company(Id)
);
CREATE INDEX IDX_8479cf14fe5c41c38aa3e182d4 ON CompanyBusinessMapping (BusinessId);
CREATE INDEX IDX_0d0acbceb7ea4e547ef5ba1abe ON CompanyBusinessMapping (CompanyId);
CREATE TABLE CrawlerJob (
    id CHAR(36) DEFAULT (UUID()) NOT NULL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress FLOAT DEFAULT 0.0,
    province VARCHAR(100),
    page_number INT,
    company_url VARCHAR(500),
    started_at DATETIME,
    finished_at DATETIME,
    log LONGTEXT
);
CREATE TABLE District (
    Id BIGINT NOT NULL PRIMARY KEY,
    Code VARCHAR(500) UNIQUE,
    Name VARCHAR(500),
    Type VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DeletedAt DATETIME,
    ProvinceName VARCHAR(500),
    EnglishName VARCHAR(500),
    ProvinceId BIGINT,
    Slug VARCHAR(255)
);
CREATE UNIQUE INDEX District_pk2 ON District (Code);
CREATE INDEX District_Id_Code_Name_index ON District (Id, Code, Name);
CREATE TABLE Province (
    Id BIGINT NOT NULL PRIMARY KEY,
    Code VARCHAR(500) UNIQUE,
    Name VARCHAR(500),
    Type VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DeletedAt DATETIME,
    EnglishName VARCHAR(500),
    Slug VARCHAR(255)
);
CREATE UNIQUE INDEX Province_pk2 ON Province (Code);
CREATE INDEX Province_Id_Code_Name_index ON Province (Id, Code, Name);
CREATE TABLE Ward (
    Id BIGINT NOT NULL PRIMARY KEY,
    Code VARCHAR(500),
    Name VARCHAR(500),
    Type VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DeletedAt DATETIME,
    DistrictName VARCHAR(500),
    ProvinceName VARCHAR(500),
    EnglishName VARCHAR(500),
    DistrictId BIGINT,
    ProvinceId BIGINT,
    Slug VARCHAR(255)
);
CREATE INDEX Ward_Id_Code_Name_index ON Ward (Id, Code, Name);