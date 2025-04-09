create table Business
(
    Id        bigint        not null
        constraint PK_a185fd060148157900126b052eb
            primary key,
    Code      nvarchar(10)  not null
        constraint UQ_c16db0121cee0db757496b7b8d5
            unique,
    RootCode  nvarchar(10),
    Name      nvarchar(255) not null,
    CreatedAt datetime2
        constraint DF_9c41cdaef1a0636539a9b474704 default getdate(),
    UpdatedAt datetime2
        constraint DF_292a0aff0d7c2108f9b62c75c42 default getdate(),
    DeletedAt datetime2
)
go

create unique index Business_pk
    on Business (Id)
go

create unique index Business_Code_Unique
    on Business (Code)
go

create table Company
(
    Id                        bigint        not null
        constraint PK_5f471f29996cc218989cd4dc164
            primary key,
    Code                      nvarchar(100) not null
        constraint UQ_7d71430f75bc1cb7929feba8e75
            unique,
    Name                      nvarchar(255) not null,
    EnglishName               nvarchar(255),
    Representative            nvarchar(255),
    RepresentativePhoneNumber nvarchar(255),
    PhoneNumber               nvarchar(255),
    Address                   nvarchar(500),
    Description               nvarchar(4000),
    IssuedAt                  datetime2,
    TerminatedAt              datetime2,
    StatusId                  bigint,
    NumberOfStaffs            bigint,
    CurrentStatus             nvarchar(255),
    CreatedAt                 datetime2
        constraint DF_cbfef068b6827a31d9d13e5050e default getdate(),
    UpdatedAt                 datetime2
        constraint DF_53654b0faf7529483480c1ea6ce default getdate(),
    DeletedAt                 datetime2,
    Director                  nvarchar(100),
    DirectorPhoneNumber       nvarchar(100),
    CommencementDate          datetime2,
    AccountCreatedAt          datetime2,
    TaxAuthority              nvarchar(100),
    Slug                      nvarchar(255)
)
go

create unique index Company_pk
    on Company (Id)
go

create unique index Company_Code_Unique
    on Company (Code)
go

create unique index Company_Code_uindex
    on Company (Code)
go

create table CompanyBusinessMapping
(
    CompanyId      bigint not null
        constraint FK_0d0acbceb7ea4e547ef5ba1abe8
            references Company,
    BusinessId     bigint not null
        constraint FK_8479cf14fe5c41c38aa3e182d4c
            references Business,
    IsMainBusiness bit
        constraint DF_cf68e7c1190796780aa1499510f default 0,
    constraint PK_d329e1b77b7a01c16549e17d2fe
        primary key (CompanyId, BusinessId)
)
go

create unique index CompanyBusinessMapping_pk
    on CompanyBusinessMapping (CompanyId, BusinessId)
go

create table CompanyStatus
(
    Id          bigint        not null
        constraint PK_f36e7e1ed465d609a7c69e8b5a4
            primary key,
    Code        nvarchar(100) not null,
    Name        nvarchar(100) not null,
    EnglishName nvarchar(100)
)
go

create unique index CompanyStatus_pk
    on CompanyStatus (Id)
go

create table CrawlingStatus
(
    Id   bigint        not null
        constraint PK_5465e9ebd5bd80d665fd50ff962
            primary key,
    Code nvarchar(100) not null,
    Name nvarchar(100) not null
)
go

create unique index CrawlingStatus_pk
    on CrawlingStatus (Id)
go

create table Province
(
    Id          bigint        not null
        constraint PK_76f06583861d3c9ee167e80c682
            primary key,
    Code        nvarchar(10)  not null
        constraint UQ_0b20348929c92f46d150d74a82c
            unique,
    Name        nvarchar(100) not null,
    CreatedAt   datetime2
        constraint DF_4255e26f27accde5084e4755dbc default getdate(),
    UpdatedAt   datetime2
        constraint DF_bf50d49bde1f381beccd68d9267 default getdate(),
    DeletedAt   datetime2,
    EnglishName nvarchar(100),
    Slug        nvarchar(100)
)
go

create table District
(
    Id          bigint        not null
        constraint PK_6dcc0f21c2adacf8c568c444f3c
            primary key,
    Code        nvarchar(10)  not null
        constraint UQ_a343921f157c83f26986f11550b
            unique,
    Name        nvarchar(100) not null,
    CreatedAt   datetime2
        constraint DF_08a30e25f2d3349b9d60813cf62 default getdate(),
    UpdatedAt   datetime2,
    DeletedAt   datetime2,
    EnglishName nvarchar(100),
    Slug        nvarchar(100),
    ProvinceId  bigint
        constraint FK_41111858943aff66203b07c359c
            references Province
)
go

create unique index District_pk
    on District (Id)
go

create unique index District_Code_Unique
    on District (Code)
go

create unique index Province_pk
    on Province (Id)
go

create unique index Province_Code_Unique
    on Province (Code)
go

create table Ward
(
    Id          bigint        not null
        constraint PK_aef8828d183e418b8a7f32f5a50
            primary key,
    Code        nvarchar(10)  not null
        constraint UQ_29174554202c07bf97d5fcce70e
            unique,
    Name        nvarchar(100) not null,
    CreatedAt   datetime2
        constraint DF_397c2b53a4053d54067da3890a3 default getdate(),
    UpdatedAt   datetime2,
    DeletedAt   datetime2,
    EnglishName nvarchar(100),
    Slug        nvarchar(100),
    DistrictId  bigint
        constraint FK_d85e4459dfc2f6c7cc3792678ec
            references District
)
go

create unique index Ward_pk
    on Ward (Id)
go

create unique index Ward_Code_Unique
    on Ward (Code)
go

create table WebSource
(
    Id        bigint        not null
        constraint PK_911b02d9c009fe11e6382eed998
            primary key,
    Code      nvarchar(100) not null
        constraint UQ_f492e6dbf4926ac5578ef09bbd4
            unique,
    Name      nvarchar(100),
    Link      nvarchar(255) not null
        constraint UQ_f20f9004f829e967dda6e5b86eb
            unique,
    CreatedAt datetime2
        constraint DF_2ea7d6f6a446cd71325bd91ad56 default getdate(),
    UpdatedAt datetime2
        constraint DF_08e55ca13b6c5f94eb372442d9d default getdate(),
    DeleledAt datetime2
)
go

create table CompanyCrawlingLog
(
    Id               bigint not null
        constraint PK_0224b5aec356b2c9b9d07e9003f
            primary key,
    CompanyId        bigint not null
        constraint UQ_cd6bc8e6aedecc395efa2954947
            unique
        constraint FK_cd6bc8e6aedecc395efa2954947
            references Company,
    CreatedAt        datetime2
        constraint DF_b3eabf1d79f929ba78e242f14e7 default getdate(),
    UpdatedAt        datetime2
        constraint DF_c60ee2b16245ec856fba8c4bdeb default getdate(),
    DeletedAt        datetime2,
    WebSourceId      bigint
        constraint UQ_9dc6c84efc92d7b02256f53f3f9
            unique
        constraint FK_9dc6c84efc92d7b02256f53f3f9
            references WebSource,
    Message          nvarchar(4000),
    CrawlingStatusId bigint
        constraint FK_e4b5b9f1bcb5fc58d820b1015dd
            references CrawlingStatus
)
go

create unique index CompanyCrawlingLog_pk_2
    on CompanyCrawlingLog (CompanyId, WebSourceId)
go

create unique index CompanyCrawlingLog_pk
    on CompanyCrawlingLog (Id)
go

create table ProvinceCrawlingLog
(
    Id               bigint not null
        constraint PK_0ccc3cb07a768cf6e8edc242ddd
            primary key,
    ProvinceId       bigint not null
        constraint UQ_7749754bf788edb8d18c0c633ee
            unique
        constraint FK_7749754bf788edb8d18c0c633ee
            references Province,
    CurrentPage      bigint
        constraint UQ_48d77dafec3dd83f5008359d555
            unique,
    TotalPage        bigint
        constraint UQ_7decdfcf9683aad290f32b881bc
            unique,
    WebSourceId      bigint
        constraint UQ_f1e2fc797387c406ed25d1d873b
            unique
        constraint FK_f1e2fc797387c406ed25d1d873b
            references WebSource,
    Message          nvarchar(4000),
    CreatedAt        datetime2
        constraint DF_6f8273d10fee9f623d1edbed1b8 default getdate(),
    UpdatedAt        datetime2
        constraint DF_4c45bf66a895ae3d3b2291343d7 default getdate(),
    DeletedAt        datetime2
        constraint DF_8d1cf4b2d92190bae42e1d72c8d default getdate(),
    CrawlingStatusId bigint
        constraint FK_2daea0f90ecc11d72e8de544479
            references CrawlingStatus
)
go

create unique index ProvinceCrawlingLog_pk_2
    on ProvinceCrawlingLog (ProvinceId, WebSourceId, CurrentPage, TotalPage)
go

create unique index ProvinceCrawlingLog_pk
    on ProvinceCrawlingLog (Id)
go

create unique index WebSource_pk_3
    on WebSource (Link)
go

create unique index WebSource_pk_2
    on WebSource (Code)
go

create unique index WebSource_pk
    on WebSource (Id)
go

