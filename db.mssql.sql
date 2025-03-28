CREATE TABLE Business (
    Id BIGINT PRIMARY KEY,
    Code VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    DeletedAt DATETIME2
);
GO

CREATE TABLE CrawlerJob (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Type VARCHAR(20) NOT NULL,
    Status VARCHAR(20) NOT NULL,
    Progress FLOAT DEFAULT 0,
    Province VARCHAR(100),
    PageNumber INT,
    CompanyUrl VARCHAR(500),
    StartedAt DATETIME2,
    FinishedAt DATETIME2,
    Log NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE Province (
    Id BIGINT PRIMARY KEY,
    Code VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(500),
    Type VARCHAR(500),
    EnglishName VARCHAR(500),
    Slug VARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    DeletedAt DATETIME2
);
GO

CREATE TABLE District (
    Id BIGINT PRIMARY KEY,
    Code VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(500),
    Type VARCHAR(500),
    ProvinceId BIGINT NOT NULL,
    EnglishName VARCHAR(500),
    Slug VARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    DeletedAt DATETIME2,
    FOREIGN KEY (ProvinceId) REFERENCES Province(Id)
);
GO

CREATE INDEX IX_District_ProvinceId ON District(ProvinceId);
GO

CREATE TABLE Users (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Name VARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE ApiKeys (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    ApiKey CHAR(64) NOT NULL UNIQUE,
    "Plan" VARCHAR(50) DEFAULT 'free',
    RequestLimit INT DEFAULT 500,
    RequestsUsed INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_ApiKeys_UserId ON ApiKeys(UserId);
GO

CREATE TABLE ApiUsageTracking (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ApiKeyId BIGINT NOT NULL,
    Endpoint VARCHAR(255),
    ResponseTime INT,
    StatusCode INT,
    CalledAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ApiKeyId) REFERENCES ApiKeys(Id)
);
GO

CREATE INDEX IX_ApiUsageTracking_ApiKeyId ON ApiUsageTracking(ApiKeyId);
GO

CREATE TABLE Ward (
    Id BIGINT PRIMARY KEY,
    Code VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(500),
    Type VARCHAR(500),
    DistrictId BIGINT NOT NULL,
    ProvinceId BIGINT NOT NULL,
    EnglishName VARCHAR(500),
    Slug VARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    DeletedAt DATETIME2,
    FOREIGN KEY (DistrictId) REFERENCES District(Id),
    FOREIGN KEY (ProvinceId) REFERENCES Province(Id)
);
GO

CREATE INDEX IX_Ward_DistrictId ON Ward(DistrictId);
CREATE INDEX IX_Ward_ProvinceId ON Ward(ProvinceId);
GO

CREATE TABLE Company (
    Id BIGINT PRIMARY KEY,
    TaxCode VARCHAR(100) UNIQUE,
    Name VARCHAR(500),
    Description NVARCHAR(MAX),
    Representative VARCHAR(500),
    MainBusiness VARCHAR(500),
    Address VARCHAR(500),
    FormattedAddress NVARCHAR(MAX),
    IssuedAt DATETIME2,
    CurrentStatus VARCHAR(500),
    AlternateName VARCHAR(500),
    Slug VARCHAR(2048),
    IsCrawledFull BIT,
    ProvinceId BIGINT,
    DistrictId BIGINT,
    WardId BIGINT,
    MainBusinessId BIGINT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    DeletedAt DATETIME2,
    FOREIGN KEY (ProvinceId) REFERENCES Province(Id),
    FOREIGN KEY (DistrictId) REFERENCES District(Id),
    FOREIGN KEY (WardId) REFERENCES Ward(Id)
);
GO

CREATE INDEX IX_Company_ProvinceId ON Company(ProvinceId);
CREATE INDEX IX_Company_DistrictId ON Company(DistrictId);
CREATE INDEX IX_Company_WardId ON Company(WardId);
GO

CREATE TABLE CompanyBusinessMapping (
    CompanyId BIGINT NOT NULL,
    BusinessId BIGINT NOT NULL,
    PRIMARY KEY (CompanyId, BusinessId),
    FOREIGN KEY (CompanyId) REFERENCES Company(Id),
    FOREIGN KEY (BusinessId) REFERENCES Business(Id)
);
GO

CREATE INDEX IX_CompanyBusinessMapping_BusinessId ON CompanyBusinessMapping(BusinessId);
GO
