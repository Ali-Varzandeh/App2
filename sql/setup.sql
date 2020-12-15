DROP DATABASE app_dev;
CREATE DATABASE IF NOT EXISTS app_dev;
USE app_dev;

CREATE TABLE CATEGORIES(
   ID   INT              NOT NULL AUTO_INCREMENT,
   CATEGORY_TITLE        TEXT  NOT NULL,
   CATEGORY_SUB          TEXT  NOT NULL,
   CATEGORY_DESCRIPTION  TEXT  NOT NULL,
   PRIMARY KEY (ID) 
);



CREATE TABLE PRODUCTS(
   ID              INT           NOT NULL AUTO_INCREMENT,
   CATEGORY_ID     INT           NOT NULL,
   NAME            VARCHAR (255) NOT NULL,
   BRAND           VARCHAR (100) NOT NULL,
   SIZE            VARCHAR (100) NOT NULL,
   COLOUR          VARCHAR (20)  NOT NULL,
   QUANTITY        VARCHAR (100) NOT NULL,
   PRO_DESCRIPTION TEXT          NOT NULL,
   UUID            VARCHAR (255) NOT NULL,
   PRIMARY KEY (ID),
   FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORIES(ID)
);

CREATE TABLE ADDRESSES (
   ID       INT           NOT NULL AUTO_INCREMENT,
   LINE1    VARCHAR (255) NOT NULL,
   LINE2    VARCHAR (255) NOT NULL,
   LINE3    VARCHAR (255) NOT NULL,
   POSTCODE VARCHAR (45)  NOT NULL,
   PRIMARY KEY (ID)
);

CREATE TABLE USERS (
   ID         INT          NOT NULL AUTO_INCREMENT,
   USER_NAME  VARCHAR (45) NOT NULL,
   FIRST_NAME VARCHAR (45) NOT NULL,
   LAST_NAME  VARCHAR (45) NOT NULL,
   PASSWORD   BINARY  (64) NOT NULL,
   IS_ADMIN   BOOLEAN      NOT NULL DEFAULT 0,
   TEL        VARCHAR (45) NOT NULL,
   EMAIL      VARCHAR (60) NULL,
   ADDRESS_ID INT          NOT NULL,
   PRIMARY KEY (ID),
   FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESSES(ID)
);

CREATE TABLE BASKETS(
   ID            INT           NOT NULL AUTO_INCREMENT,
   USER_ID       INT,
   BRAND_NAME    VARCHAR (100) NOT NULL,
   CATEGORY      VARCHAR (100) NOT NULL,
   SIZE          VARCHAR (100) NOT NULL,
   QUANTITY      VARCHAR (255) NOT NULL,
   ITEM_SUBTOTAL VARCHAR (255) NOT NULL,
   PRIMARY KEY (ID),
   FOREIGN KEY (USER_ID) REFERENCES USERS(ID) 
);

CREATE TABLE SHIPPERS (
   ID           INT          NOT NULL AUTO_INCREMENT,
   COMPANY_NAME VARCHAR (45) NOT NULL,
   TEL          VARCHAR (45) NOT NULL,
   PRIMARY KEY (ID)
);

CREATE TABLE ORDERS (
   ID              INT          NOT NULL AUTO_INCREMENT,
   ORDER_NUMBER    VARCHAR (45) NOT NULL,
   ORDER_DATE      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
   SHIPPING_DATE   TIMESTAMP    NOT NULL,
   PRIMARY KEY (ID)
);

CREATE TABLE PRODUCTS_BASKETS(
   ID          INT          NOT NULL AUTO_INCREMENT,
   BASKET_ID   INT          NOT NULL,
   PRODUCT_ID  INT          NOT NULL,
   PRIMARY KEY (ID),
   FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCTS(ID),
   FOREIGN KEY (BASKET_ID)  REFERENCES BASKETS(ID)
);

CREATE TABLE PRODUCTS_ORDERS(
   ID          INT         NOT NULL AUTO_INCREMENT,
   PRODUCT_ID  INT         NOT NULL,
   ORDER_ID    INT         NOT NULL,
   PRIMARY KEY (ID),
   FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCTS(ID),
   FOREIGN KEY (ORDER_ID)   REFERENCES ORDERS(ID)  
);





