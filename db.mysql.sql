create table business
(
    id         bigint                               not null
        primary key,
    code       varchar(100)                         not null,
    name       varchar(500)                         null,
    created_at datetime default current_timestamp() null,
    updated_at datetime default current_timestamp() null on update current_timestamp(),
    deleted_at datetime                             null,
    constraint code
        unique (code)
);

create table crawler_job
(
    id          char(36) default uuid()              not null
        primary key,
    type        varchar(20)                          not null,
    status      varchar(20)                          not null,
    progress    float    default 0                   null,
    province    varchar(100)                         null,
    page_number int                                  null,
    company_url varchar(500)                         null,
    started_at  datetime                             null,
    finished_at datetime                             null,
    log         longtext                             null,
    created_at  datetime default current_timestamp() null,
    updated_at  datetime default current_timestamp() null on update current_timestamp()
);

create table province
(
    id           bigint                               not null
        primary key,
    code         varchar(100)                         not null,
    name         varchar(500)                         null,
    type         varchar(500)                         null,
    english_name varchar(500)                         null,
    slug         varchar(255)                         null,
    created_at   datetime default current_timestamp() null,
    updated_at   datetime default current_timestamp() null on update current_timestamp(),
    deleted_at   datetime                             null,
    constraint code
        unique (code)
);

create table district
(
    id           bigint                               not null
        primary key,
    code         varchar(100)                         not null,
    name         varchar(500)                         null,
    type         varchar(500)                         null,
    province_id  bigint                               not null,
    english_name varchar(500)                         null,
    slug         varchar(255)                         null,
    created_at   datetime default current_timestamp() null,
    updated_at   datetime default current_timestamp() null on update current_timestamp(),
    deleted_at   datetime                             null,
    constraint code
        unique (code),
    constraint district_ibfk_1
        foreign key (province_id) references province (id)
);

create index province_id
    on district (province_id);

create table users
(
    id            bigint auto_increment
        primary key,
    email         varchar(255)                           not null,
    password_hash varchar(255)                           not null,
    name          varchar(255)                           null,
    is_active     tinyint(1) default 1                   null,
    created_at    datetime   default current_timestamp() null,
    updated_at    datetime   default current_timestamp() null on update current_timestamp(),
    constraint email
        unique (email)
);

create table api_keys
(
    id            bigint auto_increment
        primary key,
    user_id       bigint                                  not null,
    apiKey        char(64)                                not null,
    plan          varchar(50) default 'free'              null,
    request_limit int         default 500                 null,
    requests_used int         default 0                   null,
    is_active     tinyint(1)  default 1                   null,
    created_at    datetime    default current_timestamp() null,
    updated_at    datetime    default current_timestamp() null on update current_timestamp(),
    constraint apiKey
        unique (apiKey),
    constraint api_keys_ibfk_1
        foreign key (user_id) references users (id)
);

create index user_id
    on api_keys (user_id);

create table api_usage_tracking
(
    id            bigint auto_increment
        primary key,
    api_key_id    bigint                               not null,
    endpoint      varchar(255)                         null,
    response_time int                                  null,
    status_code   int                                  null,
    called_at     datetime default current_timestamp() null,
    constraint api_usage_tracking_ibfk_1
        foreign key (api_key_id) references api_keys (id)
);

create index api_key_id
    on api_usage_tracking (api_key_id);

create table ward
(
    id           bigint                               not null
        primary key,
    code         varchar(100)                         not null,
    name         varchar(500)                         null,
    type         varchar(500)                         null,
    district_id  bigint                               not null,
    province_id  bigint                               not null,
    english_name varchar(500)                         null,
    slug         varchar(255)                         null,
    created_at   datetime default current_timestamp() null,
    updated_at   datetime default current_timestamp() null on update current_timestamp(),
    deleted_at   datetime                             null,
    constraint code
        unique (code),
    constraint ward_ibfk_1
        foreign key (district_id) references district (id),
    constraint ward_ibfk_2
        foreign key (province_id) references province (id)
);

create table company
(
    id                bigint                               not null
        primary key,
    tax_code          varchar(100)                         null,
    name              varchar(500)                         null,
    description       text                                 null,
    representative    varchar(500)                         null,
    main_business     varchar(500)                         null,
    address           varchar(500)                         null,
    formatted_address text                                 null,
    issued_at         datetime                             null,
    current_status    varchar(500)                         null,
    alternate_name    varchar(500)                         null,
    slug              varchar(2048)                        null,
    is_crawled_full   tinyint(1)                           null,
    province_id       bigint                               null,
    district_id       bigint                               null,
    ward_id           bigint                               null,
    main_business_id  bigint                               null,
    created_at        datetime default current_timestamp() null,
    updated_at        datetime default current_timestamp() null on update current_timestamp(),
    deleted_at        datetime                             null,
    constraint tax_code
        unique (tax_code),
    constraint company_ibfk_1
        foreign key (province_id) references province (id),
    constraint company_ibfk_2
        foreign key (district_id) references district (id),
    constraint company_ibfk_3
        foreign key (ward_id) references ward (id)
);

create index district_id
    on company (district_id);

create index province_id
    on company (province_id);

create index ward_id
    on company (ward_id);

create table company_business_mapping
(
    company_id  bigint not null,
    business_id bigint not null,
    primary key (company_id, business_id),
    constraint company_business_mapping_ibfk_1
        foreign key (company_id) references company (id),
    constraint company_business_mapping_ibfk_2
        foreign key (business_id) references business (id)
);

create index business_id
    on company_business_mapping (business_id);

create index district_id
    on ward (district_id);

create index province_id
    on ward (province_id);

