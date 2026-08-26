--
-- PostgreSQL database dump
--

\restrict 48fsBphEj3l5Zxhs6RitNv15BkiEWcI57Kz6mqoq6nV5c25IVdCSjrtCVgCfltm

-- Dumped from database version 14.24 (Ubuntu 14.24-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.24 (Ubuntu 14.24-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EnquiryStatus; Type: TYPE; Schema: public; Owner: growbill
--

CREATE TYPE public."EnquiryStatus" AS ENUM (
    'OPEN',
    'REPLIED',
    'CLOSED'
);


ALTER TYPE public."EnquiryStatus" OWNER TO growbill;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: growbill
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO growbill;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO growbill;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admins OWNER TO growbill;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.analytics_events (
    id text NOT NULL,
    event text NOT NULL,
    page text,
    meta jsonb,
    device text,
    city text,
    country text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.analytics_events OWNER TO growbill;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    view_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    badge text,
    image text,
    audience text DEFAULT 'UNISEX'::text NOT NULL
);


ALTER TABLE public.categories OWNER TO growbill;

--
-- Name: enquiries; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.enquiries (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    message text NOT NULL,
    product_id text,
    status public."EnquiryStatus" DEFAULT 'OPEN'::public."EnquiryStatus" NOT NULL,
    reply text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.enquiries OWNER TO growbill;

--
-- Name: fabric_types; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.fabric_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.fabric_types OWNER TO growbill;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    size text,
    price_per_unit numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO growbill;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.orders (
    id text NOT NULL,
    order_number text NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total_amount numeric(10,2),
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO growbill;

--
-- Name: pricing_slabs; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.pricing_slabs (
    id text NOT NULL,
    product_id text NOT NULL,
    min_quantity integer NOT NULL,
    max_quantity integer,
    price_per_unit numeric(10,2) NOT NULL
);


ALTER TABLE public.pricing_slabs OWNER TO growbill;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    product_id text NOT NULL,
    image_url text NOT NULL,
    alt_text text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_images OWNER TO growbill;

--
-- Name: products; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    gsm integer NOT NULL,
    video_url text,
    is_active boolean DEFAULT true NOT NULL,
    category_id text NOT NULL,
    fabric_id text,
    style_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    available_sizes text[] DEFAULT ARRAY[]::text[] NOT NULL
);


ALTER TABLE public.products OWNER TO growbill;

--
-- Name: styles; Type: TABLE; Schema: public; Owner: growbill
--

CREATE TABLE public.styles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.styles OWNER TO growbill;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
af194577-4173-4591-8689-250b4e5cd603	fb1ef0d3948d3354fbbe2509c83669efee44cd42ef0a898b65cfc9754d9ede27	2026-04-11 04:54:07.102678+00	20260407000001_init	\N	\N	2026-04-11 04:54:06.995303+00	1
d5c9173e-a88a-4b59-86d9-2fc99e2f23ea	1c16e760eee1625e0bbede744d6c1dc82f1ac0f8a77bb8d753ae2cd1f7a06165	2026-04-12 10:46:06.677312+00	20260407000002_add_analytics_events	\N	\N	2026-04-12 10:46:06.654363+00	1
d242f306-2a74-43c4-92dd-7584821c8e41	1831c42261b0a863b878c546d2f960dcb4cb092fca65aae8ef9b6a030b411a92	2026-04-26 20:08:08.99727+00	202604210001_add_category_badge_image	\N	\N	2026-04-26 20:08:08.99141+00	1
78f7ae43-1fd3-4678-aebc-14d83b5659a2	a4b0e91d5656e5fbabd45582cf270ae1bf867c384a58eb37dddf7092b89a3c56	2026-04-26 20:08:09.004783+00	202604260001_add_category_size_profile_audience	\N	\N	2026-04-26 20:08:08.998707+00	1
ae1deb12-a851-40f2-8f42-854f9e73e0c4	ada85b80893971ad6696a5ab2c08de81fef388ab6666a11299986abe77768c56	2026-04-26 20:08:09.011865+00	202604270001_add_product_available_sizes	\N	\N	2026-04-26 20:08:09.006304+00	1
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.admins (id, email, password_hash, name, created_at) FROM stdin;
6d7e51d2-2a9a-4266-8b59-c822b846fd60	admin@primelinor.com	$2b$12$v8vTb9nNyLjRxXwUz4upjODoVVsq5Meb.j9xtbl91uX27MJT35Y2K	Admin	2026-04-11 04:55:24.289
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.analytics_events (id, event, page, meta, device, city, country, created_at) FROM stdin;
44d07812-d186-470e-af1c-31c2e1b2d7c5	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	Noida	India	2026-04-12 10:56:05.157
92b3bdb8-8165-4238-8775-8e2c7b1ecabc	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-12 10:56:05.212
0e5a958d-a048-46f8-ba66-f6c8e75ad256	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-12 10:56:12.627
12a928b5-0557-4d8c-a8e7-50ee616ac582	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-12 10:56:14.73
76d2e15d-1e95-4510-a04c-a58f630a989c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-12 10:56:14.837
293559d2-2842-46bf-a374-d964263e4889	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-12 10:56:46.511
a6a62d09-2a9d-4d57-9cfc-559107cf6573	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-12 10:56:51.124
345f1909-efc8-4ffe-84b5-a9742b4da738	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-12 10:56:57.466
0aa47519-0947-4877-8217-644ee9d82419	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Noida	India	2026-04-12 10:56:57.471
5a8ee0f9-79bd-413b-b1b4-3c4e3f246cc1	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-12 10:56:57.485
4b0786d3-98ae-4047-aaf1-09de8bcec724	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-12 10:57:06.169
4a362fdd-57e9-4ebd-a1e1-3cf065ca66a4	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-04-12 15:19:43.813
fcbdb538-9c5e-42aa-862e-b60a0328e724	page_view	/	{"path": "/"}	desktop	Washington	United States	2026-04-12 16:18:50.559
c3977d34-de57-4b6b-b265-19bd2bdbb6ea	page_view	/	{"path": "/"}	desktop	Vancouver	Canada	2026-04-12 16:57:22.942
4f1e418c-4b96-45b5-99e7-e990351f43c2	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-12 18:07:36.911
dd4a7df7-fb13-4194-8ec0-d558ec205fb3	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-12 18:08:15.663
3f81440a-5309-4db8-9a65-9f86f472fb4b	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-12 19:12:22.721
4e5db927-0f76-4d88-ac8a-8184a0f5af03	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-12 19:12:40.833
2b92cd29-5d5d-4d2c-b60f-656e1ac7fdc7	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-13 03:07:17.62
72cc9003-c102-4474-93d2-36cf0b32c67d	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-13 03:07:21.752
5faab569-a6c7-4a31-8b4c-31429c8be7b3	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Noida	India	2026-04-13 03:07:21.753
7120f40c-8298-4807-95da-b1e2eadeb4ad	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-13 03:07:21.809
6edc11c2-2449-4cbd-91fd-a84d34105e78	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-13 08:59:36.853
82cce495-3243-4aff-a34a-3c329b7bf2b6	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-13 09:02:58.76
0a6d38c4-9ca8-458b-a9b6-e16f2b1d385a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-13 13:28:34.753
2210fa73-ec96-4e08-848c-0098295e5201	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-13 13:50:37.2
2461b2d9-fb6c-4af6-932d-292c937a0737	product_card_click	/	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-13 13:50:43.603
03149bb6-14c1-44ec-9213-434ee286d3fd	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-13 13:50:43.625
00de3a9f-619d-441f-ae1f-8f1b6635751d	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-04-13 13:50:43.625
084d261b-3aca-4d7e-a359-8633cd75b7ad	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-13 13:50:53.734
5479f1d9-5f70-44b1-8875-6e3a518edc5d	product_card_click	/	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-13 13:50:54.572
b451d6d2-27d0-4157-a7d8-c0eb04e75b7d	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-04-13 13:50:54.64
b86f8a6b-9a05-46e7-8d3a-eba88fc7a850	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-13 13:50:54.672
08b157a0-d6ce-40be-b58b-c2002dce38d0	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-13 13:51:06.784
659ed676-ce25-4df1-ae01-92e3a7a7fd50	product_card_click	/	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-13 13:51:08.382
8cea6bea-1d86-4722-8a4d-920c3de7c1f2	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-04-13 13:51:08.446
9922ad01-d5c9-4419-b791-3fd3fe389838	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-13 13:51:08.481
334f3cb0-c375-4431-8e97-9af73955d825	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-13 13:51:15.91
7d4da42b-d493-4036-9585-58161e151c6a	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-13 14:44:20.202
d9b558bd-b5e0-4ee6-b2bf-e71909edab00	product_card_click	/	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Noida	India	2026-04-13 14:44:40.113
ed688c5f-6375-464b-b371-4a74a8e2254f	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Noida	India	2026-04-13 14:44:40.132
72a8c840-4436-40ab-9a6b-3fedec21d20e	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Noida	India	2026-04-13 14:44:40.14
eae1b437-193d-4cfc-a68f-af14bc476b85	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-13 14:45:56.213
47e87d49-5a13-475e-8e68-2c2157a47249	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Noida	India	2026-04-13 14:46:07.03
a8fcdf92-53eb-405f-b7de-ed1f1dfd39cc	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-04-13 14:46:07.037
bc26ddaf-16e9-4174-a4b8-add0f8aea31e	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-13 14:46:11.925
87db2185-2c11-4287-9423-a944b650fd5a	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Noida	India	2026-04-13 14:46:30.465
8e582647-39e3-448f-8b5c-0e32159bfb75	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-04-13 14:46:30.474
e01231a8-08f4-4f2b-8d24-271f211b6a0e	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-13 14:46:32.593
9c0a4ce2-146a-4518-be1d-c1b4d181545c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-13 15:30:43.723
ff3365d4-0cbd-46a7-864c-4a9eae207086	product_card_click	/	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-13 15:30:53.677
9a8972d9-a8cc-455d-956c-1c1238a64894	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Noida	India	2026-04-13 15:30:53.687
6f7d5fb1-f7bb-44af-87e4-8d09e8238148	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-13 15:30:53.724
d62dc27c-4115-41d1-a5a6-6fbb708b16b2	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-13 15:31:12.897
66457a88-898d-46cb-96e0-110157b43a49	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Noida	India	2026-04-13 15:31:14.412
41dcd0ed-5144-4f7a-9ed3-56bd90fefed2	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-13 15:31:14.483
e8bc0fb5-37ea-4dd7-abdb-cadd47dc41b1	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-13 15:31:14.996
b955ebbc-b05f-4aab-b693-925f07524e74	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 19:07:06.15
a0efd877-402d-4832-8ad1-2832ee6f88f1	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-04-13 19:07:37.934
18c04c08-e31d-4bbd-8cdf-f2de8be2a259	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 19:07:52.612
9d9d7a2a-67aa-459e-843b-b5ed5384b34e	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-04-13 19:08:24.744
1a84f609-0232-4240-9245-bb929ac265a9	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 20:12:21.717
5a945566-2316-4898-979a-28571ac4e921	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 20:13:07.555
a5c353ad-7f2d-4479-959c-50e09054cbe1	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-04-13 20:13:38.175
b6915a4b-6dea-4336-b128-e5a195304c97	page_view	/	{"path": "/"}	tablet	Warsaw	Poland	2026-04-13 20:14:57.654
40076053-3c4b-4bf1-8078-65f4b35b3d49	page_view	/	{"path": "/"}	tablet	Warsaw	Poland	2026-04-13 20:15:33.286
24d7ca22-c922-4a2c-a226-bbcaee9bcf45	page_view	/products	{"path": "/products"}	desktop	Warsaw	Poland	2026-04-13 20:16:02.069
14a3a6d7-8e7d-4414-9676-f06c49e3c2f7	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-04-13 20:24:55.041
69523963-2147-42e7-970e-f48a2117fefb	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 21:12:00.361
d486c001-e5fc-4e5e-aa6d-49b8ab420c69	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-04-13 21:12:31.686
a176e265-1461-47dc-8ba4-826d64ed49bd	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 21:12:47.442
598beb36-f8f4-4e1d-9b53-04bc7641edaa	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-13 22:11:45.892
3a407eea-6277-4acf-9bac-e13796d051aa	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-14 00:17:37.258
13b98b65-00d2-4c59-9b8c-7adf77d50650	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-14 01:43:37.026
65b09b6d-f5df-426b-b4a0-98e816780b2d	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-04-14 03:12:47.022
6ca6f7c3-aac9-4485-b2c4-dec45109b184	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-14 10:42:54.179
b51fa67c-7212-4a2f-95b2-0911d9cf6fd0	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-04-14 11:59:06.623
f769ff00-aab3-46a0-9a1e-b25469379308	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-14 12:37:04.556
32682b50-e759-419b-9ac8-989dff889df8	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-14 12:37:04.6
2fcedbea-4005-4429-8602-fd3adb065a7b	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-14 15:00:54.824
c1423278-9e3b-4d02-96e7-0b839e014f30	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-14 15:01:04.371
c35619a6-f91d-40cd-957e-6fd15d57b056	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-04-14 15:01:04.375
67a0675e-3fa0-4a7f-a809-bebedd66fc10	product_card_click	/	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-14 15:01:04.853
a5c8ddf3-a978-4188-9c5e-f2a33185b1c7	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-14 15:01:36.762
560b403e-6024-4016-8f68-7a03e742d14a	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:14:38.88
5251d2e1-c583-4733-8056-f7081018cc04	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:14:38.902
b8d56e0a-21a6-4d11-94f3-a997a78c40f6	product_card_click	/	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:14:39.06
856d6ff4-b0dc-4c50-a079-f46c93e325b0	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:17:38.749
a2e16e62-0672-44dd-af9f-553cd813efbe	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:17:38.771
bf2164f4-7d20-4684-8ec3-4854201f0428	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:26:50.429
df261f90-1ca5-4a48-86ca-8a65e9c1b48b	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:26:50.444
1116aa58-f886-4f46-9afb-aa1a076ad249	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:27:01.479
4d77f6f4-4082-433b-ba7d-86bed31da500	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:27:01.498
4b18da69-dc99-4fa4-bf81-027e31994a6a	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-14 15:27:10.602
7153bcb9-4c30-4d0d-b2ef-9d0d65dc44c3	product_card_click	/	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:27:12.868
23c07a8a-61b9-4d65-9745-006e4bbc0070	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:27:12.955
e4477ab1-4908-49d5-b13d-6a1e0bb96572	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:27:12.968
df5a8b26-1098-4af7-903d-5a1d14ef809f	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:41:25.78
3804f114-10fe-4fc9-bec6-7f6c2dfbfb20	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:41:25.789
bd7c532a-16e4-4b2e-9a7b-94a73ff2be5b	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 15:42:59.469
9380207c-0670-498b-b49a-7e24616920b6	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 15:42:59.496
967c10a4-9337-4de5-926e-a12fb1ae26d6	page_view	/	{"path": "/"}	desktop	San Francisco	United States	2026-04-14 16:06:59.565
0822b2bb-7a98-465b-8bac-13aa8766cb0f	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-04-14 16:18:27.995
82f6cf53-d5c0-4e66-835e-adea8cdcc7c2	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 16:18:28.012
14904d62-5a8f-4018-a616-8c8d18112e1f	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-14 16:19:05.969
fce4a73c-b8f9-4803-b4cb-0825757455f2	product_card_click	/	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-14 16:19:06.991
5097549b-e2eb-4076-8c9f-08018e3daec2	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-04-14 16:19:07.068
3575e532-defd-41b6-9d4d-4e6b48af61d9	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-14 16:19:07.097
8c267ec0-52cb-4e97-aac7-b30d17b50e0e	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-14 16:20:46.383
df94317f-b9b8-42d9-9734-53013d6ed252	product_card_click	/	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 16:21:11.675
2d1507ef-d89b-4000-af92-ff6b05284bd8	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Delhi	India	2026-04-14 16:21:11.695
bd73ccb4-fcce-4477-b1e5-22b7c779ca05	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-04-14 16:21:11.924
82bdf939-88f3-4428-bf56-1dedba540215	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-15 01:20:45.175
c851ad0d-db82-4796-96d3-443caf9ef29d	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-15 08:46:33.072
69e16523-b0a1-4153-a3a6-42eda3733bc6	product_card_click	/	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 08:46:39.326
d19143be-ddc3-484b-bab4-b4ec05e68fc4	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-04-15 08:46:39.335
2954fae2-c26d-477f-bae8-ad76c04d7ad4	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 08:46:39.345
3ad4d749-9990-4eba-be7d-34f7f255b5db	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-04-15 08:56:53.409
ce3fef22-88d4-4f17-8387-4dd4cf0761a7	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 08:56:53.421
586aaac0-6b45-47f1-aa6b-81fd0696f03d	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 09:02:09.534
98137d54-d914-4a8a-aa9d-5bd6241fa691	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-04-15 09:02:09.53
8309285c-fdd9-4628-8ab6-8aa333a569d9	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-04-15 09:18:38.342
32f69bcf-99ac-48d7-88ad-ddccc3c366e5	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 09:18:38.351
72aeb063-2d9e-41f1-848a-b549296bb81a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-15 09:18:57.242
c3c18aae-640c-4771-ab5c-3d0e4ac2e142	product_card_click	/	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 09:19:00.33
05cb0fce-0869-452a-ba7b-637adcedc855	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-04-15 09:19:00.422
3f84fc1f-4bb5-495a-a4a7-fe70d8438e9c	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 09:19:00.457
7d47c276-7c5f-40b2-858f-b65abec8d673	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-15 10:56:05.605
232834b7-4ccf-4be9-928d-26b064872b9b	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-15 10:56:25.827
f051c5cc-7e44-4b6f-8b8e-d58318da8d25	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-15 10:57:13.28
447d4c78-4329-494e-8403-c267609814f7	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-15 10:57:13.337
3b9c573c-a8cb-45cf-8410-b359e96f6cfd	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-15 10:57:19.339
9151541a-f7b4-48a4-95a5-ccb849ee5b25	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	Noida	India	2026-04-15 10:57:19.394
7bc91ae5-a37f-4ef3-a8b5-339bbf2d6427	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-15 10:57:19.406
b01b488b-614b-4166-919c-0f240d47ac88	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-15 10:58:18.266
74f954af-ec89-4177-98f1-99fe6dbdfc56	product_card_click	/	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-15 10:58:36.009
9ee79b3a-822b-4954-a095-d6f3700312d3	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Noida	India	2026-04-15 10:58:36.025
4ed37cf6-9c2e-4400-9bef-277b2cd90205	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-15 10:58:36.049
2c4f3da5-1603-44bf-9853-1287019f13e5	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-15 11:52:12.9
f9e45fa2-595c-43d5-8abf-a35f73b18a3c	product_card_click	/	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 11:52:32.794
5e697c85-3fcb-41c1-b30c-76af836dee0e	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-04-15 11:52:32.807
ee7930e0-8568-4630-8d94-9c26bb194e2f	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 11:52:32.811
f59c592b-7968-4619-be83-fe81c697248b	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-04-15 11:53:26.411
93c521b7-2335-46a0-9aa5-8c08b362b2b6	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 11:53:26.42
dc2c6f3b-43b1-4926-ae56-d90b2638645c	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-04-15 12:29:47.873
e3edbfe9-a6c2-40f6-af42-dae7884e551c	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-15 12:29:47.877
0f3c49ca-cf06-4964-b856-51cc0515c881	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-15 12:29:49.241
8ff14d49-bfae-4c55-8907-adb6cbb59cc3	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-15 12:30:00.068
c16484ed-f9cb-4298-8d67-a59018f38a30	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-15 12:30:00.113
3f7de66d-5697-46f7-adba-2fe454fc4097	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-15 12:30:03.568
2b74504b-1e70-48cb-9620-6b46e2cd6548	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-15 12:30:03.579
86f34b0a-5f9b-4637-b50f-2ee8075eb2c9	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-15 12:30:03.677
ebdcb7f6-b990-4622-94ca-6a3f8bc8cc5a	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-15 12:30:12.608
4976c53f-24c8-458b-ab01-b1287699cbcb	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-15 12:30:19.424
466171c2-fb15-45c4-8597-8394b7f0fbc8	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-15 12:31:08.292
fb213063-1efa-4d44-a603-ed0d75e511f7	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-15 12:31:08.294
44ad3923-337c-4800-8f37-01563ecd3bbe	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-15 12:31:12.913
273afcb2-524a-4e9e-9ae5-f90ae7ff38b2	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-15 12:31:12.917
6ccc9585-9c8b-49b4-b235-538de6cfde44	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-15 12:31:12.952
592382cf-9e56-40f6-a8a2-a8b45875f231	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-15 12:31:26.459
773b2fe5-535d-4664-b6f8-64e8a5d12fdf	page_view	/	{"path": "/"}	desktop	Springfield	United States	2026-04-15 17:44:39.856
e682eab3-eb48-40fd-8d1a-62c02c7ce5da	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-15 19:07:33.866
daf6055e-f18b-4980-9e60-6eef5eb302d7	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-04-15 19:08:05.146
337a4bae-69f6-4be1-8a8b-58c01a1bc9cc	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-04-16 03:25:23.732
64c6e3c6-873d-415a-892e-1076a4395a25	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-16 06:04:17.671
76c2074d-af86-4b5c-bfb5-cd5439dd0428	product_card_click	/	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:04:23.909
568e7c60-2726-4227-9a49-24e7fc323941	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-16 06:04:23.918
8086a541-1d4c-4ff8-b95c-e8f7926d0cc8	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:04:23.927
daa16709-4845-4397-8ed9-e30a1bb351f6	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-16 06:10:46.586
e539da14-e460-42ae-a09f-e1568d2e1bf4	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 06:10:51.674
c43677c9-a114-4254-99f8-dad4b8af7aa3	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:10:54.591
f6d3d7ba-2713-4839-aeec-bc22dfde8469	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 06:10:54.657
6a41b29e-a644-43f0-81d6-2ac90fb31d94	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:10:54.725
dc01e419-247c-4140-b40b-35e3e813c8da	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 06:16:50.819
dd765735-c067-4452-b2fe-f0b43f0c6517	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:16:50.822
95412a1b-5e7e-4469-8656-54a6180b073e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 06:28:09.241
f8dc0dd4-0860-4279-a915-7788933d2525	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-16 06:28:15.004
97ea4c5e-689a-4a0e-977d-ed3b28b83123	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-04-16 06:28:15.017
30a99efa-20f4-4567-b18f-bf9c3e886ec9	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-16 06:28:15.022
87296521-129d-429f-b39b-65f5d2cf4deb	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 06:32:53.782
ae90a3a6-8f09-404a-83a1-40b44309cf66	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:32:58.124
2bd78ad0-5183-4b11-ae70-992cabae41e0	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 06:32:58.137
54b67a3f-05e8-4785-be1f-5371ee348a83	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:32:58.177
f6d89b5c-7df4-4495-a564-8ff135c3773a	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 06:56:38.851
dc9e8c47-a3aa-4a5a-945b-4f046592e732	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 06:56:38.879
0fc2fb68-3511-447b-890b-b9b1f3645926	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 07:07:23.527
04679af6-dbd9-4612-b209-7c8e3516272b	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "ROUND NECK T-SHIRT", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 07:07:23.53
6ebaac4c-7597-44da-96b7-3776ed6b832f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 07:07:33.968
a07fa3d5-15d8-4bc4-a9ac-d011c57de018	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 07:12:15.437
1351ee87-68fa-48bb-aee5-5576053a0755	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 07:12:24.728
b00e2376-3e94-47ad-934a-6fe87b80c3c7	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 07:12:24.736
f8e01189-2dc2-45d3-9583-c908e46dc68a	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 07:12:24.743
c427a6bf-bf7e-4141-b6a0-ecaf488ca961	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 09:29:22.293
d20d5d79-327f-4e31-af00-47c82d55bdfb	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 09:29:22.814
dab201f3-62c2-4953-8a3e-6e04436d12c9	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-04-16 09:29:55.975
a335187e-0b78-4f99-85e3-e462a1c60722	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 09:29:59.465
d321933a-0f98-4f27-a273-47d95e38f557	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-04-16 09:29:59.565
7da43b51-5591-40e4-96e4-a8827e514d7a	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	New Delhi	India	2026-04-16 09:30:01.328
50f8821a-6108-4247-8c11-a6b4b0f0f090	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	New Delhi	India	2026-04-16 09:30:03.044
f3b664d6-17ba-46b4-b7fe-187bfb983564	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 10:46:30.345
19dbc20d-a2f5-4521-b1b9-33bc55cc18e7	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-04-16 10:46:35.429
0f76ae95-92ad-402e-b65a-d2c7faba1d69	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 10:48:47.36
73db5ec0-481b-4925-99f2-0506676c49b1	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-16 10:48:47.369
6ea89e4d-39a2-459b-b19a-d97bbb7bcbee	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-16 10:48:47.388
79dc8db8-13df-4a0e-b4a7-5e5f321060ae	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 10:48:54.261
46869c8c-7fba-4d0f-aeb9-ecc726c1b329	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	New Delhi	India	2026-04-16 11:11:38.661
be8cfb86-a5e7-49e7-8369-f171a83e2499	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	New Delhi	India	2026-04-16 11:11:39.904
95a9c8a7-516f-401f-b0c0-a70c8939420b	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-04-16 11:11:41.121
447c5db7-ca15-4a06-b929-a09cb25427fe	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	New Delhi	India	2026-04-16 11:12:17.924
4eb47de4-722c-4a3d-bcd8-92912a552bbb	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-04-16 11:12:24.506
874d7fa2-60c1-4939-a47b-501ceccd4805	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 11:44:30.87
43b90e53-4fe6-454f-82d0-f48bd217298a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-16 11:45:01.921
66e1b0fe-4ecf-4522-a2f6-234dd1814b0a	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	New Delhi	India	2026-04-16 11:47:19.725
03f42d76-750e-495a-bf10-8a6f7f5ed4af	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 11:47:19.734
c079e95a-0303-4451-b3b1-d5fd5854c081	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-16 13:09:29.722
2d559b90-5ce5-46d6-ab0c-66ac09bd820b	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-16 13:09:30.63
4670c680-756a-480d-bcde-7b54d169bae4	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-16 13:09:31.794
d37ad24d-e4a0-4338-9194-35c21b76a7ea	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-16 13:09:42.216
b6af3d32-bf82-4058-80ec-6a74384db786	page_view	/	{"path": "/"}	desktop	Falkenstein	Germany	2026-04-16 22:27:24.652
f7d9e159-b524-46f4-b82b-d2c643cd9889	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-17 05:35:04.063
2798fa74-37cd-4b37-bcb7-520e4599d862	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-17 06:30:48.758
279bf8be-230c-43d4-8aec-d08206708615	product_card_click	/	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 06:30:55.418
23beb360-2f63-45bf-8909-acef82e89892	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	New Delhi	India	2026-04-17 06:30:55.433
565fd9ab-38bf-414c-8b48-90d2a24b3651	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 06:30:55.449
d3c5e9ed-a3dc-4f8b-9892-1239a82aa995	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-17 07:00:24.793
66ac9ea6-4709-4876-ac29-c89d6d3de1bd	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 07:00:29.517
00be501e-c092-4b8b-908d-a93a8b83d23d	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-17 07:00:35.494
79c05f3e-d8fe-42bc-b69e-fe4669d652be	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	New Delhi	India	2026-04-17 07:00:35.498
6074d74c-6b19-430f-9e32-0abf4d709519	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-04-17 07:00:35.506
29b12294-e718-472f-a1e4-b7b46153a7ec	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 07:04:56.612
0af82b6d-7fa3-475b-8af9-84ac62b0cf02	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 07:32:27.617
e62c57bf-1b2b-426e-9d49-116e5b519943	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 07:32:35.58
7a70ce6e-e77b-4874-a5d3-dc010b0cd1d9	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-17 07:32:35.59
3cf06529-c381-495b-8f14-78aa7bfa9501	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 07:32:35.61
a6681960-a116-4a51-a657-ed5673b1b252	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-17 07:59:48.948
145aebda-7aed-4aef-8e27-75a5f5166d29	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-17 09:21:42.456
e5f5b6c9-71e4-48d2-8422-e36190dc709b	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 09:21:42.464
f2ac2924-f4b7-4bbb-8fbc-34da144f7b45	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-17 09:22:01.114
053f5a15-0d84-46c4-85d4-6db4b661f548	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:03:55.6
d74b51bf-b8ed-4f0d-8751-c67edf90f299	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 11:03:55.646
41021789-402d-4bdd-b704-a1da00bf0760	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:03:58.644
af64c303-1a20-4971-8c67-3c0bc2b45f6e	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	New Delhi	India	2026-04-17 11:03:58.645
cb49f915-b1ec-49fd-bdaf-66316255b34d	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:03:58.75
0a2666e7-03c3-4226-804e-f297a031ba16	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 11:04:06.831
b2c4e945-332c-497f-afd0-8777283181b4	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-17 11:04:07.727
e003f1cd-6b9b-41c7-94e6-b2d0d1b80fcb	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:04:07.775
648cc053-7c1c-423e-b328-fc4650a88a9a	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:04:07.811
a362b2be-fc6f-4dd8-9329-79b10074e45e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 11:04:14.518
f720bad7-ad46-4e71-ad8d-ddfff0af3b7a	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:04:15.414
823dfebf-14ba-4470-9df0-992809ca534a	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-17 11:04:15.495
69dc1af2-7683-4b8e-a9bd-926d7fda4ca2	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-17 11:04:15.534
6616deab-3ab7-4497-b98e-c3f668ac7082	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 11:04:21.69
91c7d5b1-a1c0-4d00-8f17-966820e3dc63	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-04-17 11:04:34.829
41bc58a3-5f39-498c-9e2d-10e4030b60f2	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	New Delhi	India	2026-04-17 11:04:36.616
5abd4dfe-9845-46db-923f-a3ceef7f44fc	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	New Delhi	India	2026-04-17 11:04:38.145
3038a011-4a64-4840-96ed-d582e4090e43	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	New Delhi	India	2026-04-17 11:04:42.635
f083f2ba-171c-4bd3-889b-2ec19fead8e7	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 11:04:45.489
35f9243b-9941-43fa-953a-6dd4af50772c	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-17 11:04:45.555
80a7c4cd-ff63-453b-a5a8-31243ef0d37b	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 11:04:45.588
9cf02928-bf68-45cb-b9c0-8adfee74c917	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 11:04:53.452
0fc1922a-d841-4cea-be22-c03fbfdcf7c7	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 11:19:41.892
cb301c40-afc0-45c4-a943-a7020fecc83b	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-17 11:19:42.117
0d557266-9b13-479a-8c7e-5abac1c33172	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 12:15:40.307
d04d0f53-063e-4b34-9301-d1fd69ecdf53	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:15:43.21
52b23579-520e-4090-a9f1-4915a316d9f6	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-17 12:15:43.282
a1d7c6f9-6292-4790-b312-8ce7300b699a	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:15:43.329
172bd285-cb47-4f56-a328-80471df44cc5	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-17 12:15:53.33
6f70efaa-48f2-4783-a1b2-1dfb0c0cae94	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:15:53.334
fc4ff98b-4d9e-49bc-8bb2-f6cac20761c9	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-17 12:24:02.758
f98b0e35-9c07-4b14-877a-aa1f7044deff	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:24:02.782
8c858947-2b28-4995-b802-0a98aaa57c19	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-17 12:49:10.374
ced04a0a-5785-4cf5-a178-1753c99fc4e9	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:49:11.694
ed229161-a581-4716-a633-a997167da615	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 12:49:11.886
451c426f-0340-47dd-9b0a-65b3466084b1	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:49:13.895
d50e7d73-977b-493e-8e59-1dd2e2248a5a	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-04-17 12:49:13.907
12140be8-3861-4f6f-a20d-8455fe047bf1	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:49:14
edaeb37e-e456-42b3-90da-aa524b8d0611	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 12:49:23.327
aac471ff-55e0-4020-a7cf-9a9e064708c5	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:49:31.963
c020c7fa-53ec-4879-ac15-a162e61dfa10	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-17 12:49:31.97
e1845df2-33ad-450a-911e-2cc1dded5213	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-17 12:49:31.971
2c992955-34d1-43b1-a543-5847f0db538e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-17 12:49:48.646
b0cef895-391f-4048-bbb5-92b9f84802fa	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-17 21:06:32.752
2b743073-fb1b-44d8-b6ef-491d8717f689	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-18 05:19:54.771
45e079b1-2f13-494c-8cec-0f9ee385dcff	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 05:19:54.777
8c2a4151-427a-4690-b33d-ec0e19f71191	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 05:19:55.27
09779e70-26af-4116-a92d-9a83f5339f05	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 05:20:19.753
b124b7ac-7aa8-45a2-8fae-2e4f1c3b0517	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-04-18 06:00:08.325
bac1efe8-39fb-46b8-b97b-f7017cae0954	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 06:43:42.768
13315da1-cbd3-4c82-8a0a-9f10714b3aa3	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-18 06:43:42.77
c249c20b-7adf-46f7-b442-df23b83b04f5	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:18.525
da99c15d-50f9-4204-9b76-075a339dd02d	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:21.796
3617e11e-834d-4d8f-8703-40812b1d93bf	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:22.048
d42e42ee-4b0f-4710-8cea-66cc729bd7ae	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:25.831
a7235415-a2c2-4c52-ad2a-a6477c998bf9	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:26.001
fc1915bc-e26b-496a-a57f-dc87b2bc2cd5	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:26.067
d4017bce-e270-4615-9251-b57a8b2fece0	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:26.073
4aefb068-91c7-4efd-a9b6-2a5ab963a000	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:26.073
fa0e0c59-f0a9-4b69-bdab-69818504bdab	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:26.567
7211b6ba-b709-49d1-8bf6-42c5d627ff02	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:28.176
6bfb3633-f9e1-4960-966f-ed5cbda6577f	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:28.177
0e78b910-42d0-475b-a53f-0447f3560151	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:28.179
b1abdbcc-c838-4c6d-8df4-73c2cb25b0fd	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:28.178
5c09105d-1b22-4a58-9170-b8058b6ef2ca	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:28.356
7bbd34e1-3c6b-4e4f-bbbf-8ac1e15f06b3	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:31.062
794d9e7f-7249-46f7-b12f-260fca52478e	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:31.263
a0df691c-f3af-4399-9dba-b307e9e57798	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:31.505
0c9b112d-e41c-417f-840e-34114c9aee20	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:34.502
35c2bee6-0b70-40c2-a32e-8fc61fa9baa4	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:34.699
aeeeb470-d9f5-4bb7-94d7-39e909de71d5	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:35.069
647765ff-23d4-45d8-b3c4-59134830a4ac	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:35.429
a9ad68e7-4a7d-40a5-bc61-c416e61d5d60	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:35.723
0c95518b-7c49-4b78-a62e-6336a9ef2a40	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:35.959
041112c1-7991-4be5-9705-c5f10fa843cd	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:36.296
de4b2c5e-6644-4364-b962-8237927d0d31	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:36.502
fd142e67-5ffe-4a3f-a95f-a7c847348673	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-04-18 06:45:36.754
32ec3828-5cc2-4a77-b9d9-666fddbc49f4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 06:45:39.357
775970b5-9067-433f-94c8-7720d5ab91bc	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-18 06:50:52.229
dc778a01-74b4-4055-b2d3-dd4bc7cb2622	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	New Delhi	India	2026-04-18 06:52:35.092
e75889bf-8722-4054-b715-fa51b39db2f6	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-18 07:00:03.953
4d7c9365-cdcc-428e-9943-34b0cd4a4d41	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-18 07:18:27.176
fa98e6e4-7718-4777-98c7-36b9fba67797	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-18 07:18:35.883
4655d086-c9ab-4e21-966a-3cbe21ac32ea	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-18 07:18:40.698
25b9f3eb-6ab9-4067-b08e-dc3e026035d8	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-04-18 07:18:40.724
7db43de1-3579-428a-8f2a-2b367cf26313	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-18 07:18:40.751
e9097fc8-0113-4a4c-8b94-90a8506d6259	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-18 07:19:23.943
99729617-c158-4c43-9e49-0e152f415b65	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-18 07:20:31.107
e32dbb52-3c1c-4f12-b5bb-1a199ec4a680	product_card_click	/	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-18 07:20:36.764
13fb2ccc-b29e-4245-abc5-abd01ac8f9c6	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	New Delhi	India	2026-04-18 07:20:36.771
90e65045-cddc-4334-be7f-e6dd19f7253c	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-18 07:20:36.787
c5397992-1816-42d5-ac54-2ac6daaf2c80	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-18 07:20:42.877
2afeed10-727e-4d23-ad99-9e3c2ce56958	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 09:20:10.169
c69c7357-8067-44f4-b5b5-301ff717d95e	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-18 09:20:31.504
01c0ec5d-90c2-467c-b64f-bc9da7ecea4b	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 09:20:31.531
1a35b388-7d68-466d-8362-0b11837759f4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 09:20:42.073
8cd142af-d733-43bf-b4c9-196b80086f6a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 09:22:10.957
88baad64-5953-4317-8d19-d11aee30ec5c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 15:32:12.124
4d4945d0-fb88-475f-bdf8-b4c9bec4ce9c	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-18 15:32:29.599
86dfeafd-f706-4bc4-8f24-b2c6808a9c6a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 15:32:29.678
1628c77b-00e5-4a04-acf5-931f10934b43	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-18 15:32:37.155
9cb3a401-face-4f15-96f0-24d52200936b	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-18 15:32:37.184
f6c6cbab-5a26-4644-9e55-7f950587624c	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Noida	India	2026-04-18 15:32:37.185
3b43d0fb-a060-465e-b509-51364494a7aa	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 15:32:54.749
4a78e929-5d65-48bc-bddb-bbdc129a7033	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 15:32:55.585
4faadb54-dc0c-415c-a93e-88fbc741b009	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-18 15:48:09.156
f41304b9-88d3-45dc-9953-2f946ff8b2a4	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	Delhi	India	2026-04-18 15:48:32.437
51a8759b-730f-465f-b5e3-03601c93e453	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Delhi	India	2026-04-18 15:48:42.594
bb14cf25-489e-4c71-8292-8f68ec12a98c	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-18 15:54:01.575
5cbdbb92-9f01-4c36-a41c-69c0deb89b80	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-18 15:54:50.852
2736fc81-f58e-46a3-b426-cf9f2c0bd96d	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-18 16:21:06.21
085ae35d-e902-4add-91f9-af78cf753117	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-18 16:21:06.222
f63b264e-c8ab-4f49-84fb-8a06ee07465b	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-18 16:21:08.924
28ae8c5e-eacc-417b-aaaa-4e9f35be5ffc	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-18 21:03:34.967
444e024e-04e1-4d75-a536-110ff6f83ca0	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-18 21:04:13.591
90c60dcf-9c7c-4da4-b1e6-3b67356a9b57	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-18 21:07:25.699
26e139a4-32f5-4a3c-b978-d0e4409f4b2d	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-04-18 21:07:57.315
ce302337-15db-4617-b6e1-cfafd4c723d8	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-19 01:04:14.094
82b89d2d-79e6-4816-a10c-4d125d59a182	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-19 08:16:55.544
9f703e83-5000-466f-9ce9-14122997b023	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 08:16:57.565
50ae6a2d-f5a6-4f9d-a326-e9152e8d122c	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:17:05.597
a408e3e2-983d-43bf-ae50-fe767169bf03	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Delhi	India	2026-04-19 08:17:05.604
7ab3f686-fd23-4ce9-9eaf-08bd43e33673	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:17:05.622
310fc162-0ce2-414f-8141-799143e1cb9e	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Delhi	India	2026-04-19 08:23:32.72
26125aab-db43-4db1-b391-5340cb803f77	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:23:32.728
30aeb48d-dcc6-42d0-b03a-c239ea0279ee	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-19 08:23:35.143
b25f5284-05f5-4fb2-8e7a-175b554d5b41	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 08:23:36.286
268d6a26-d3b1-461f-a7a2-a86d001d7d96	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	Delhi	India	2026-04-19 08:23:41.768
66d20042-9b89-4f80-ba8e-cef9165478c2	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-20 18:24:26.914
3d976437-5cf8-4a9c-a2c1-5e20029c41b2	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-20 18:24:47.709
e764c363-bba3-4d7a-9107-ea067a983a64	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-21 03:01:29.539
eedd9327-f063-4a08-8ed6-3b5fb9578925	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-21 06:37:19.841
3300c908-812e-4d4f-afbb-c38909e05eb7	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-21 11:03:56.385
fa55b6d2-3a30-4f21-bcfd-818f3e812580	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-22 04:30:32.416
ce81d9ff-c0f3-408b-a23e-42fbca95120a	page_view	/	{"path": "/"}	desktop	Dallas	United States	2026-05-23 00:10:34.874
586f5861-546c-4dca-b8f6-c14263c96bf8	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-23 06:52:30.193
6790f60f-a7f1-46fa-98db-312c029ff337	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-23 06:52:36.665
5272b4f1-25a3-41de-be55-b6b3dac8f96d	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-23 06:52:36.669
792e8645-6901-4922-a2df-70d79736bae9	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-23 06:52:40.248
3c25a47d-7ae4-45d1-b816-61e40fdab866	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-23 06:52:40.269
87c9708d-5c16-470f-8c7c-d5fe8c8b5e1a	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-23 06:52:40.368
d1f4a6b8-e4c4-44e1-b473-be81d37c250e	page_view	/	{"path": "/"}	mobile	Altoona	United States	2026-05-23 21:48:40.914
8a80bf61-d1d7-409e-b2e9-d72ccb0023db	page_view	/	{"path": "/"}	desktop	Detroit	United States	2026-05-24 21:38:35.781
6be7ca9e-dbbf-4df8-bfb7-01e98baa66f4	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-25 06:59:07.825
6b147752-a4c3-4327-9833-81aaad3da07b	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-25 06:59:08.586
cb2b1240-9600-4cd0-b877-10d0cfe724fb	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 09:12:52.532
c5b63694-31e4-42ca-ab09-0861bc5f6659	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:14:11.048
0c2dcfd0-a3ca-4ff3-b627-75826d2b2b13	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:13.238
78e56cbd-6d17-43e1-a7a9-d39be4e4bcad	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:13.308
e36fe705-2234-4c01-b646-ec9c747318ea	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-25 09:14:13.326
12c490a0-6a5e-4655-a3fb-7543ba010313	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:14:31.458
2abe4b0e-0832-43a4-80cc-c4aa6b472a81	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-25 09:14:31.952
15256e11-e246-4c80-8e62-9745db38bddb	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:34.066
3330b47c-40cb-4a8b-bcb6-98dc51bd1097	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:14:34.183
8188a198-6920-46bd-9170-ad132faad17f	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:35.484
a8763190-29aa-419c-917f-2e22d03faa5e	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Delhi	India	2026-05-25 09:14:35.499
db88b4fd-12d2-4816-9523-945bed8a27e9	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:35.601
4d7f9789-9279-4633-b971-ff3ebc2df1c3	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:14:50.33
b363667e-39de-4688-9e76-d7cd2c1133dc	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:54.552
daffce2e-b021-48c1-91ba-27c55895adb4	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-25 09:14:54.577
dcace790-0db3-4034-8d25-a3478de72d14	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:14:54.622
5138d5ea-4027-4200-bb58-a296c9bb8fbc	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:15:20.825
db07a6c7-c62b-4e7f-a434-24f9033e8b60	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:15:24.264
8e5f1a5b-4177-4d58-bd67-b6f447f36408	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-05-25 09:15:24.333
9070b703-da5e-490d-842d-dfa0de3238c8	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:15:24.495
52d422c2-bfb6-4f56-a927-fe2f0875d880	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 16:20:31.056
d315a73e-e596-41bf-859b-863febceebf7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 02:25:04.335
fb2a9eca-f1b5-4c3d-9830-2b4cbc92061e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 05:20:47.459
a97a3388-3a17-41f2-a432-8d7779295a10	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 06:43:00.677
20c4527a-4367-464a-ba2c-53ba227c8845	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:23:41.769
8e28a6cd-e14a-4d48-8133-ddb02c7da3c3	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:23:41.776
21cc5014-e972-4cd9-9693-f6cbd7a53d00	page_view	/	{"path": "/"}	desktop	Boston	United States	2026-04-19 08:45:33.878
2ee6b684-0a66-4232-9113-f3a1637b2e4e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 08:46:52.281
d7ebf26c-c4e6-409c-bfba-8fc4dda73d9b	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:46:55.506
3d1b8fca-d999-48c8-bbb4-3f8501baff93	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	Delhi	India	2026-04-19 08:46:55.567
344703a4-fd5b-417d-8a0d-39784d38528c	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 08:46:55.614
c9232991-9340-4954-b3d0-235d289b9632	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-19 09:37:23.596
ee6a45b4-92a7-4bf0-b253-3127b028425d	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	Delhi	India	2026-04-19 09:37:23.6
96dfbcda-97d2-44d0-9d5c-0f914a144a9a	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 09:37:25.998
77cdacec-e6c8-402a-b9a3-50d2dff9acdf	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-04-19 09:37:33.617
e22fc79e-3e4e-4478-b43a-ea7fcbbcb8ce	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-04-19 09:37:33.64
2d7a45fd-e41e-4985-a4b0-eefb4d279f2d	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-04-19 09:37:33.648
52a3d50b-db74-4ca3-a67f-0fce6eb8d11c	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-04-19 13:16:34.255
93b00167-1e42-46a1-a2db-a227d44467a1	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-04-19 13:16:34.277
1a0a8a0f-c535-49e0-bb09-7bdaa177b1e7	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-19 13:16:36.886
47f98165-a1c1-4752-9a9d-0734f544ee04	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 13:16:37.363
50d575aa-d300-44d3-b74f-c55144d7a435	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 13:30:23.225
f29bcec9-36fe-4976-b91a-78df7102afd1	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-04-19 13:31:18.206
5f2151ea-fdc9-4be8-9f68-acaa69cdea59	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-04-19 13:31:18.21
ef43b9a5-fa5a-4446-8372-470248f4ab6a	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-04-19 13:31:18.229
3a107e4f-8114-490c-962f-8da39615728f	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-19 13:31:24.588
ba704b40-0a7a-464d-a97f-d9c28e88c785	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-19 13:31:25.818
6aa36c59-0a1f-43ea-a0e9-3e71ceb3f51f	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Delhi	India	2026-04-19 13:31:31.942
ad4950e0-93a4-4204-b624-fde36fa0c5ea	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	desktop	Delhi	India	2026-04-19 13:31:31.946
ec894642-b188-4ead-8c30-193549913eb9	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Delhi	India	2026-04-19 13:31:31.991
698cf015-f6c7-489d-aafe-40a4d078bf3a	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-04-20 04:54:50.765
38f2a964-e2d8-4d48-bb68-2eef6a53833e	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-20 06:02:41.571
5c84ccc0-bea3-44e9-95cf-9829d61b038f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-20 06:02:44.334
d2a6725e-d57d-4ea6-a8e2-4310b593b981	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-20 06:03:02.852
68ccd413-279c-4a7c-bc09-8d5852449ec1	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-20 06:03:02.858
2c60dba4-fe6b-4d6f-9446-b1619593a9d2	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-20 06:03:02.858
485c5685-3fcc-4fca-9592-d2f0c73d7366	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-20 06:03:19.442
8949344c-9a90-4521-9e6b-74e9c47ac8c8	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-20 08:26:10.587
fc4ebd10-51d1-4b0d-9c8b-71530f09df97	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-20 08:26:16.509
83158718-f683-46df-9b05-07a24c6c0fc0	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Delhi	India	2026-04-20 08:26:21.2
a24bd03e-053e-4074-9347-8027acea91fe	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Delhi	India	2026-04-20 08:26:28.369
89d3232e-d096-4ce4-a4f9-99e2876189e6	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Delhi	India	2026-04-20 08:26:29.988
32fd5309-14d5-4bb7-9990-62e26045e749	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-25 14:39:57.208
8f15f15f-8b44-49a9-995b-5ffa3bd0285e	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Delhi	India	2026-04-20 08:26:32.002
e4422b44-8d5d-4884-a47b-408faadd1efe	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-04-20 08:26:34.082
59ce54fb-b02c-492d-afe0-413287f15641	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-20 08:59:21.465
35723462-642d-4ce1-952e-530f0eeb0278	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-20 15:12:45.585
e81ade20-705a-4e8a-a136-9fa8dea7fc7c	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-20 16:43:18.274
0c85a3d5-28f9-4155-9b71-26bfe20df769	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-20 21:07:38.525
83c51f2a-3b9b-45c9-b4c4-b44f87b05c3e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:10:47.238
c71ca307-bfa5-492a-9544-3b5433f67dad	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-21 10:10:47.241
71170b92-113f-4fbc-9448-c73de33fb30b	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-21 10:11:01.974
48d2f294-30f0-4e6f-bbca-1a2129f5554a	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-04-21 10:11:01.986
9fdc5991-b14b-419b-bb5e-2724ec49c0e4	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-21 10:11:02.017
fe1ccdd2-c947-4364-b5d0-9fdca3e368ff	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:11:27.282
7a1b7249-4560-41f5-bc54-6010343ccbf7	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:11:28.392
d3a1bd07-aa9a-4f73-bf62-24de0fe9c497	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-21 10:11:37.953
ee5bfb90-41c4-44a9-8b84-c33b8c8b9598	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:11:37.959
a71d6b74-ff3d-4732-837f-fbc3d7c12695	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:11:41.042
7c1a3c7b-c87e-49fa-9d11-11c3cb03ba79	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-21 10:11:47.808
b3c3edff-e2cf-4a7a-b16d-3b57a237b2c7	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:11:47.838
4a890683-31cb-41ee-8e34-0f0bbfe8ba9d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:13:30.795
a58096bd-1fa5-4f12-88ac-40f9e9251409	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-21 10:14:13.588
a98721ed-0ea9-4290-9da0-4a1de7a6ba2a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:14:13.617
8d344f79-c868-4acb-83d8-8bbe5fa051f9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:16:16.16
75e308f4-2b54-4f17-a288-e0970458b7a0	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-21 10:16:30.201
1846ca42-640d-4770-adb8-d4a8d6d62211	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:16:30.202
20d2020f-6b90-44c0-b71e-56eda16d5e45	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:18:53.434
7394dbb8-2d45-4981-a6e2-98ec4192a2ae	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-04-21 10:18:58.303
9ac439a0-8ac9-49a2-b150-45d7d853dcd5	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:18:58.414
161edb0a-b5ba-4e27-b6af-7df7096edd7d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:20:27.292
e084e2bd-74c1-4d64-b535-9fdd7f783f0d	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:20:29.817
8f4a4875-7c9f-4e7e-a3bc-efca7284e9cb	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-04-21 10:20:29.884
e36e694c-d055-4634-aeaa-33262a6940e2	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:23:25.313
30724c2a-cad3-4f12-9d65-5e2ba9fbda4f	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-21 10:23:27.642
f3bd4ea7-9cd0-4e0e-933f-eac822decbab	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:23:27.731
8038c90b-ebe2-423a-9b0d-5a964ffe1fa2	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:24:02.583
61db35b2-4d00-4755-9cb7-10de965a1a5a	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-21 10:27:23.889
3934117a-5e30-4d5e-8b37-8cccf09ce203	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-21 10:27:23.892
c24be1ff-ef81-4fbd-834a-15c71132a056	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-21 10:35:13.381
8ebb0ff1-7c6c-4cd5-8c4b-d5b27c486078	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-21 10:46:31.965
469a2dc2-a2dc-4f4a-9901-c7f1e94e5e21	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-21 11:45:33.337
8a324964-4636-4cd3-91bc-10ac45e14fad	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-21 22:06:33.478
daa57838-df3d-4173-8d29-16c9914d43dd	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-21 22:07:16.14
27dc8767-af05-40b5-8b97-db62ab8ceb29	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-21 22:54:36.764
c19cdc1d-1866-4084-b428-b60c87f7a993	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 05:22:36.407
c43e7cc7-2c86-4638-b93d-de91fd626af3	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 05:22:55.417
6234983a-f0e8-4227-952d-f09b053bf6d7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 05:22:58.848
1851315f-e669-4894-b922-e301c98b76e8	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 05:23:03.849
36ae36e1-4146-4f8e-adcd-258cbe2f04be	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-04-22 06:40:57.748
69118449-6fc9-46c3-aef3-03c5bf2ecf9a	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	New Delhi	India	2026-04-22 06:41:03.535
f92b6d18-6f8d-421e-b902-61c2b3c63a8f	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-04-22 06:42:10.16
cf78e09c-d290-41b2-995b-7284192c8f19	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	New Delhi	India	2026-04-23 13:22:34.79
3bbeefc1-71c2-4275-9133-2e1abb26fd32	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-22 06:42:10.177
b2eeee83-a3e3-4c81-b101-249249955783	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-22 06:42:10.161
fcb89962-c588-42fc-8b58-72a4be4de8d2	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 06:45:40.037
b6cd9277-1107-47a6-9eb5-eba6014c5084	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	New Delhi	India	2026-04-22 06:45:45.201
c5f27d60-4bd2-4b9d-918c-98dd9e48d068	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-04-22 06:45:46.28
485f1668-cd89-4322-a94e-cccf604f665d	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 06:45:51.525
b1a8c091-0221-45af-ad7c-3114a03fc3f8	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-22 06:45:51.532
409ee3f5-5f89-437e-9057-c4f821343275	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 06:45:51.574
0c9733ca-1b2f-4d09-925e-0cf16457fed0	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-22 07:35:35.254
c476473a-6f17-4b2d-a133-0525fd9c4e3c	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 07:35:35.27
d8910008-aee7-4bc4-b202-d2e5b0aeb6a1	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 07:35:37.868
7233358c-93e0-48c5-a3ea-7abdf2361fd2	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-22 07:35:44.697
946dfc16-bf75-47d0-b507-fae35d49632c	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	New Delhi	India	2026-04-22 07:35:44.721
bcc62020-2a8f-4ada-ac01-0791d1eb85ce	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-22 07:35:44.721
679b8074-d78a-427b-b451-0f1041f0edfb	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 07:36:01.344
061dbf63-a7a6-4f3f-aee3-87e112f85b9a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 07:36:02.141
450f2477-af1c-4c0c-84f3-ed548ad9b655	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 07:36:08.181
57d0e9ba-aa8a-4963-a923-371bbdfe9523	page_view	/	{"path": "/"}	desktop	Ashburn	United States	2026-04-22 07:41:34.17
1dfab5cd-7374-46ae-b15e-81f8272be2b6	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 08:59:32.309
2a8c8b35-2f51-4d43-b3e7-9f41aacbbadb	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:00:03.776
88ddab39-1326-4a2b-b398-25cd85f055f4	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:00:05.514
abdc9e90-ad8c-47e8-8f59-df87d0781633	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:00:06.88
26029a22-e2fa-4bc1-912d-b709227b85f0	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:00:07.804
1b1ab3b7-9eb3-4fc3-a890-30bfe61a24e0	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:00:08.219
3ccc3dca-493f-415c-9907-676079ab1aa9	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:00:10.458
72223590-954b-4aad-896c-85c6050a9319	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	desktop	New Delhi	India	2026-04-22 09:00:10.546
f0b942a6-6f87-44c1-8336-26e1b9af2233	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:00:10.558
074405d3-b7e2-497d-ad3a-f370717e718d	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	desktop	New Delhi	India	2026-04-22 09:33:14.775
9df520bb-4307-48e8-8ca8-13c669182192	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:33:14.814
bb2cea6e-ca02-4a99-a813-daca236be0f0	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 09:33:16.739
de85a2bb-23d1-436c-8bae-559db5e76fd0	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:33:17.46
41586808-40b1-4b03-b320-86f92df4fd1b	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 09:46:48.837
79ef20e8-fa92-47f6-8b10-5bad55cd5375	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:46:49.475
b16de640-a9b6-4aa5-899f-1844ef7a679f	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:46:58.666
6f73c4db-45b9-4f6a-8ae3-2218a27f9c7e	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:46:58.681
2d5e9e8b-e0b6-4349-85d0-39ea34d5f8b4	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	New Delhi	India	2026-04-22 09:46:58.668
c1f54112-964f-4910-b631-7350d6210949	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:47:08.435
81dd1f51-6f74-4a99-9a58-abb5bc6023db	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-04-22 09:47:17.662
017a95bf-dc9a-401f-b965-ef2a6dcd93e2	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:47:17.664
8a16ec31-b788-4e0b-b058-afed153389bd	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 09:47:17.666
875994b6-56e6-4400-bb16-1d966624e228	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 09:47:42.311
dba3f062-3f68-42e3-a33f-a5c383ff4154	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-04-22 09:47:52.586
b1aaa7aa-b8ec-4bc5-b6b1-ef11cd1f4775	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-04-22 12:33:13.542
074c4a97-9651-41a4-9fc4-bcc9566fc631	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 12:33:14.817
1adb85cf-c5a0-4665-a636-864d92e5280d	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 12:33:16.89
9be21f5a-ebfa-41f3-b5a1-563c933af1dc	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	New Delhi	India	2026-04-22 12:33:16.961
15d26948-2b64-4427-8387-1ace2388c62c	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 12:33:17
eedd19b5-67bc-4a73-8b32-010c5e99204f	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 12:33:40.546
31527e54-5d4f-4751-94f7-c83d0a3d1ee6	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 12:33:42.146
5b07a248-0a47-4fb6-83cc-4f6a4e866f18	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 12:33:49.465
78938059-750f-434f-8274-e482549e903f	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 12:33:58.525
e20774f9-22eb-43fa-a7e8-5ecdca1e9c98	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	New Delhi	India	2026-04-22 12:33:58.54
5245640d-56de-42d8-b1d0-4deccb97c746	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 12:33:58.545
7bc22c27-d78d-4ec6-a163-f9311f0cf8a9	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 12:34:01.226
bde96e5e-d091-45b2-8ff9-af8e47ba533d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 13:00:12.369
04ddbcd4-2b31-497d-a7c6-4ba0e999d6cb	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 13:00:15.625
3f817e43-618c-4459-854f-76907d198ae8	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	New Delhi	India	2026-04-22 13:00:15.691
2cf3e2a5-16a1-498f-8ee0-8e031bd9c90e	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 13:00:15.738
b3f44964-98d9-4db9-8e91-f9a3b35956f1	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	New Delhi	India	2026-04-22 13:03:02.687
9f8970fd-1fb7-4136-8658-c97291d1a55a	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-04-22 13:03:02.693
e1f52ff6-98ee-4cbd-b6e1-2e50bc5bce7b	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 13:03:09.747
878692b4-2b37-47cf-aa1b-2b943891c409	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-22 13:03:17.412
827e80c5-31e5-4b58-9f7b-ef7c2b8047d1	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 13:03:21.092
e8c33627-b6af-4eaa-b411-eca75c233b3a	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 13:03:21.191
89feb176-05c1-499b-894c-4f177bc3fbfc	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 13:03:30.542
33f030b8-ce46-430e-a4b9-db50c24b5001	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	New Delhi	India	2026-04-22 13:03:30.544
9fdaa324-74f9-4a12-a766-6a646292ff9d	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-22 13:03:30.553
5c35cc12-01e5-49ea-a251-dd508a646389	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-22 13:03:36.908
20d30451-e745-46d2-985d-b39bab992949	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-04-22 13:03:40.19
579b46bf-bda4-4863-8a3c-137f3abae144	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	New Delhi	India	2026-04-22 13:03:44.502
c59aff64-2173-4d8f-b500-5eab4dc8d15e	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	New Delhi	India	2026-04-22 13:03:49.293
1ffb0a98-db5a-4497-81f5-983de3b92dfa	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	New Delhi	India	2026-04-22 13:03:53.286
a9581238-e985-45c0-95b5-f17ef45ccbee	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-22 13:04:11.926
ea8f725e-335a-408a-8363-f1b8d602cacc	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-22 13:04:11.941
e1a5b18b-f869-4462-b2e8-be2617fb4d75	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-04-22 13:04:11.928
15ad86b6-b433-4704-a979-ad7efba0ba90	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-22 22:06:37.844
06481dec-32d0-4f94-8477-5d4263b1e149	page_view	/	{"path": "/"}	desktop	Newark	United States	2026-04-23 12:28:32.469
bd746f3c-8cb4-48ca-874a-38b9c7d42bb8	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-23 13:22:29.24
26dc0468-c610-4d8e-97d7-9e682fd25efc	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-23 13:22:45.108
c7deb454-76ad-4570-a995-d9d3daa6263b	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-04-23 13:23:50.863
a927504e-32e0-4b91-80ae-b199409406ed	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	New Delhi	India	2026-04-23 13:23:52.262
aeaabab3-2ecb-490a-b38a-bc7eb02187ae	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	New Delhi	India	2026-04-23 13:23:53.049
7b520633-16a2-4be1-b09f-a487688d9a81	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	New Delhi	India	2026-04-23 13:23:53.691
527ad757-1ac2-4220-bb1c-49ea8db2c7dc	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	New Delhi	India	2026-04-23 13:23:55.189
8fba69ba-df34-42a9-8389-a00ac46c1c14	phone_click	/products	{"source": "navbar_phone_desktop"}	desktop	New Delhi	India	2026-04-23 13:24:00.275
e261726e-8ba0-4bd7-bddd-d82ed40def26	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-24 11:28:33.899
42e0a158-c35b-41a9-adcc-23211148ba8f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 11:28:35.623
ed20810e-6ba0-4404-929d-0e69fc0075a2	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 11:45:22.609
0fb976dd-87aa-4573-87a9-a6051b63196a	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	New Delhi	India	2026-04-24 11:45:36.903
53ba40e2-8ff1-4db3-97a0-c6c3df33e256	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-24 11:45:36.911
2e40f5aa-9a18-4f00-853b-d7a437ad2523	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-24 11:45:36.921
b4a12fe9-80ee-4cb0-b940-bb5de7963f29	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 11:45:46.231
ac707ea7-75d9-4fc2-838f-bfcc796eda71	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 13:10:54.335
49708306-dd27-40ad-abdc-449e860daec1	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-24 13:10:58.469
77728a7a-e60c-480a-b0ce-aac70cb8dbed	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	New Delhi	India	2026-04-24 13:10:58.47
63ee991c-7252-4988-a572-997e60cf5398	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-24 13:10:58.515
9fad05ff-bcaf-43f8-ab05-d1b7f51a9c2e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 13:11:10.087
c5a0f6fc-a148-40b7-89c9-402cafcf2afc	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-24 13:11:32.85
6f278da1-4605-4088-948a-142432b94b46	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 13:11:35.043
5307f29f-9f32-4654-a7ef-dcd403d6533b	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-24 13:12:25.303
ef6e59ad-b13d-434a-8cca-06a806beee38	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	New Delhi	India	2026-04-24 13:12:25.304
144b48fb-fe96-41c3-9859-4e336e5fa996	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-24 13:12:25.308
2deab146-6bba-4f06-9724-65f7f67e1d7d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 13:12:28.902
89412161-a393-4c51-a66a-fa7029e2a43a	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 13:16:07.67
f306f5b6-d88e-4193-92f1-c938e1fe0421	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-24 13:23:38.954
95d96304-53f1-4133-9fb1-69eed6ef5e33	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-24 22:06:52.478
e1ef5198-2982-455e-91f2-146d269d939d	page_view	/	{"path": "/"}	desktop	Seattle	United States	2026-04-25 00:34:10.894
aecd29f0-fd25-499d-9d08-fe1a3e036e7b	page_view	/	{"path": "/"}	desktop	Dallas	United States	2026-04-25 00:49:38.643
73e73029-cf49-42f8-a1cb-e711bb7f6222	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-25 04:39:51.891
95957b2e-54c9-4cdd-8530-fb0be5c0e4e3	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-25 07:17:15.554
a4199893-9ecd-47a4-8e8d-64e3b83edf35	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-25 07:17:17.276
deeb303c-2680-4fe8-873e-e5f5a8602828	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-04-25 09:05:56.603
5491fc72-072e-4b16-802a-a6677e89a96d	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-04-25 09:05:57.064
e99851b3-8688-4cc7-a441-dba5cc42c3a6	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-25 11:12:50.058
7fe48589-0788-420f-91fc-024307302dfa	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-04-25 12:38:00.558
ff97bb63-eeff-4594-bc80-4615cc33a21b	page_view	/	{"path": "/"}	desktop	Forest City	United States	2026-04-25 12:38:57.474
440a87b9-b53e-4126-9bba-92bcada9ef40	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-25 13:31:35.269
74d5e69e-e23f-4c8d-b702-38f9b6ffbe38	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-25 13:31:41.411
dce6edea-aa92-4424-9c02-f52fae9d20b7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-25 13:31:58.374
dd7b06d8-95bf-4b21-b0d0-cc738133ad52	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-25 14:03:35.849
010f5442-f0c2-408a-aedb-3f592e788f0f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-25 14:03:35.894
cdba8854-860f-4aea-a01d-c3a83d04795c	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-25 14:03:37.144
834a8cc5-30fb-4c82-a1dd-128a8baf4537	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-25 14:03:42.286
d82a956a-80b5-4dfa-af48-38d180ec8c63	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-25 14:03:42.294
84f34f99-248f-4249-b99d-e1be9e7923fb	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-25 14:05:23.658
c42d8e3e-1253-4b5a-9503-722d6ae885e9	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-25 16:13:22.761
d889a35e-fa90-4b87-9f98-9b5abd2980fd	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-04-25 16:26:45.985
1d61e304-81c0-49cd-b947-e23d1c881eb4	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-04-25 20:11:16.689
ee5f3dbd-badd-47bd-bb94-4be7be6b1f74	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-04-25 20:11:17.239
cc2dedf3-6b00-41d6-9f91-e95765015624	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-04-25 23:57:14.47
e10b794f-1f18-4669-b05e-707aa8d91611	page_view	/	{"path": "/"}	mobile	Noida	India	2026-04-26 06:38:30.242
80035e5a-354b-4d6b-bb33-dde17f195c23	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 07:31:53.506
d93b579d-6ec4-4a97-9b55-328d8878d964	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 07:48:06.437
67773d5a-91af-42ba-974e-ab00132fd068	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-26 07:49:39.062
1d071604-c969-4411-a970-6d19bae5d04c	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-26 07:49:46.887
a1832066-d65d-43c1-8011-633f0205aac6	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-26 07:49:46.899
126aa882-284b-4f40-8e20-82df2f7bffc2	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Noida	India	2026-04-26 07:49:46.921
40d0a28e-8123-4754-bd2c-6f7da200ba72	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Noida	India	2026-04-26 08:00:29.809
9e2b7950-af75-4685-88dd-b6c64efbed85	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-26 08:00:29.829
81b4b112-d147-432e-b3dc-e24d6c77d5aa	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 08:00:30.42
e1a5eabf-38b4-4072-8448-f99443bec468	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-26 08:00:35.072
df589bf6-0cdf-4e8d-8c68-34946b0d6faa	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-26 08:00:36.957
cc85c095-5828-458e-8fa7-f4816ff189a0	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Noida	India	2026-04-26 08:00:37.029
5e14d773-35e4-41a2-8daa-662937e7bba2	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-26 08:00:37.069
208037af-0e62-4ede-882e-28f701125f26	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 08:13:26.711
83c35718-9413-4038-879f-a6b95aa41580	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:47.15
814aecbc-eff1-4606-8485-54543ad27cb9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:49.889
92eddd0a-f7f8-4760-8e68-658db77a350f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:50.861
e0e53f58-9355-4c70-9a54-2c536c8dea01	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:58.84
c3e2309a-52ff-4ee1-b5b0-0ac5550b0199	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:59.275
28fbdca6-3a98-4dc8-84f3-7f9b448bc3f2	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:59.532
ac1608a8-3caa-48cf-bbf6-f090d2ecb474	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:59.718
e08c8e8e-0d1a-4f70-b4e1-87ea6d612c74	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:09:59.902
61da5906-ba59-4fe6-a9c7-2e445df786cc	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:10:00.388
be3c9b1d-0627-4607-9b1d-5f563bc7dc5d	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-26 20:10:05.375
dd71496c-f896-4de3-afee-459bc52961bb	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-26 20:10:05.412
b1928c59-cb82-4c9a-aef8-7105785a5cec	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-26 20:11:45.902
bfb20d45-bb5a-447c-b7f1-8549236aac3f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:11:46.992
4ed53b38-2f8d-4006-924a-f6d5daf54cf6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:11:48.291
69bdfe03-5ede-408c-9321-74a8263ac6df	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-26 20:11:52.213
436b5b8a-4dff-4e1e-9023-74e8f752b30f	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-26 20:11:52.278
57627305-b335-4efc-858a-720a35bccb9a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:11:53.171
bc6812cc-2018-43d4-b3bb-a457794c2065	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:12:58.326
56cbb73a-6c19-4b0f-9bc3-2b8aa7490cc6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-26 20:13:35.185
d252c1d1-931b-44c7-a752-a180827e22bd	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-26 22:06:19.211
25d2619d-099f-4a15-b81e-e378f4682abf	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-04-27 05:04:58.552
847d7e0c-0017-4598-b03a-bf6dfa9562b3	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-04-27 08:08:00.695
41510278-6271-4ba6-a3f2-eaedb8c958aa	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-04-27 08:09:21.752
7b4d1948-7f84-4897-a4de-4dadace57c27	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-27 09:12:23.196
ba055b28-23de-4edb-acfd-8fa7c4728fb3	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-27 09:12:33.051
f6d91d66-5754-4633-94f6-5e09d66a94a8	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-27 09:12:37.684
0a3ba4a7-4e32-47fc-97ee-0de8ec914374	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	New Delhi	India	2026-04-27 09:12:37.712
a69c4f80-e898-4627-b89f-2b9f1b9d6fbf	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-27 09:12:37.756
a4734a2b-47d5-496b-9d94-a7a881e5ea7a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-27 09:12:48.365
bc48dba2-2615-4217-a84c-6d5988014151	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-27 09:12:49.096
d72cec19-0276-4bd9-bec4-6d856d8308c0	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 17:16:46.181
b62ebd85-d409-4bdb-b2e4-aa8c4364410b	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-27 09:13:28.014
c78730b6-f8c9-4149-a1e5-42d77b031454	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	New Delhi	India	2026-04-27 09:13:28.016
4246c83b-b742-488d-9139-55da6718e778	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-04-27 09:13:28.018
92227596-8620-4611-b1ee-c66d4aa8f7aa	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-04-27 09:57:16.48
fe8dbdc6-6d27-4d17-b52b-6d4bfd1e4d14	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-04-27 10:11:52.729
9cd5e445-6912-407d-8f98-14dd58ee2b0a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-27 11:34:12.36
d4dfa02b-8ce3-4f89-bc4a-048ba05e9e76	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-04-27 11:34:22.434
202cf5f2-c850-420b-a81f-6ffe9f81f796	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-27 11:34:22.461
fbf65293-a716-4fe9-96a9-e1f949990910	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-27 11:34:25.706
fc07f661-6b27-4473-becb-1414b4ca1a86	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-27 11:34:46.369
28907905-5131-4042-864e-5a7bfbaf0ba7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-04-27 11:35:12.107
5440cdaf-aef5-493e-8a60-5bf19a09ef43	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-04-27 11:35:13.054
1cabb567-93b8-45a0-ad6b-292becc07844	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-04-27 12:48:10.587
bbb8f871-3651-450b-8751-0b27aa2e6c56	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-04-27 12:48:37.085
8f5e3944-d884-42f5-a8da-6beca64bc5ca	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	New Delhi	India	2026-04-27 12:48:37.106
517803b0-4f3c-44a6-a848-3b56161abd43	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-04-27 12:48:37.109
0bbe339e-5c33-49c4-bbe5-86190117ea8c	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-04-27 12:48:55.318
0620bbbe-cf85-41a2-b7ed-0ded7dd1ed58	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-27 13:44:37.612
18c9bfed-7d30-4383-8a2f-96996b64b73f	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-27 13:44:58.969
b790ea59-a2e7-405f-a42f-7776c5a3c920	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-27 13:45:00.798
2895f5f4-1acd-4b33-bd3a-516d7a53e041	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-27 15:07:53.947
0a2ab1ab-f9cb-4efa-8565-7c9099881923	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 15:07:59.032
f8e3b7f9-acb6-4846-8e73-1ff908a29112	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:08:02.116
2b36bc7f-7888-4e59-8764-021675db759c	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:08:02.194
0139970a-762a-4afe-89a0-3595ddcfdd2c	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Delhi	India	2026-04-27 15:08:02.215
554f91e0-4c24-47dc-a950-a6b86cfcf854	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 15:08:14.015
395b06d9-e5a9-4280-bc18-174c44e1251a	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:08:15.118
56061726-7d98-45a0-af15-5c697ee75adb	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Delhi	India	2026-04-27 15:08:15.219
db980b53-751b-4f6a-af56-849dd290725e	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:08:15.232
fd8c5ce2-2656-4f4d-b381-cafaa295da62	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:21:50.035
7689cd46-154f-4183-a01d-f4f9661de360	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Delhi	India	2026-04-27 15:21:50.038
0659cdbb-3db7-42e3-b3f6-01efad100fa2	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 15:21:53.337
3a4e064c-e4dc-4d75-bb57-17ecba56c4fb	product_card_click	/products	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:21:56.234
4d6cba26-65cb-4f07-b3ba-1e91b7abf8d6	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	desktop	Delhi	India	2026-04-27 15:21:56.294
4d16bd87-bcce-4e8a-8da2-c984d9a58e2f	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-04-27 15:21:56.302
8a279462-f31a-4ec6-a386-16fc6296b346	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 15:22:22.657
b53242db-c246-44ff-86f7-ad0f4e04a525	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 16:59:04.511
3dcf7f72-a230-49c9-a9c1-254c0010f629	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-04-27 16:59:13.905
61870122-e25e-4d6e-a01f-b5ccae19281d	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-04-27 16:59:13.922
b763a742-f042-4359-a71b-93168f9e9388	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-04-27 16:59:13.996
0969f2e5-3fee-4be4-9a3f-e968b593cbaf	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-04-27 17:00:17.213
b2043f49-152c-45ed-82ca-9bc6fd53116e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-04-27 17:00:19.907
8f7aff5e-0e84-4485-95e0-9fef477345e6	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-28 00:07:13.88
a3c59547-e012-4f9e-83b5-3f8b0bc0a8d3	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-28 13:40:41.79
f127ba47-0193-4bdf-81da-f8be04e8f36c	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-04-28 13:40:43.901
3db81408-cd3b-4c1c-9df4-91dd5092e0e1	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-28 13:40:44.02
9e2ee1a3-25b2-4ab9-bb3b-328168339954	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-28 13:40:49.649
f79e8425-058e-48c3-b9b8-3857d745b510	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-28 13:40:58.937
3101be42-ba79-4bb4-8cdc-3bd0a6a05c7c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-28 13:40:58.965
51568746-308b-42a2-90aa-e6346891d471	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Noida	India	2026-04-28 13:41:04.184
8223807a-7003-4c6d-879a-f67421ad3737	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-28 13:41:04.196
b66528d7-f096-41ca-95a4-9ec7fd0a5589	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-28 13:41:04.184
02b2a48e-b366-48a7-beae-60c9440f370c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-28 13:41:15.021
86d63d8d-d166-482c-a499-d1a95a49e1e0	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-28 13:42:16.571
be04a687-3448-425e-b1d4-c55da1daaa78	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-04-29 01:07:12.101
0c5bffca-0537-40ee-96b3-240c3ec0337f	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-04-29 09:21:35.286
f70bbbdd-1018-4528-80b6-1ce8fbe1d1fc	page_view	/	{"path": "/"}	desktop	Council Bluffs	United States	2026-04-29 14:22:09.137
1a75e4ac-20f8-42b5-876f-93af756f08e5	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:06:40.064
fdce6711-5dc4-4940-ba05-70f95ce609a5	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:08:08.354
3ab76bf8-e067-4174-b7d0-3f2826ccfb5b	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:08:09.551
a0fcce94-8091-4c01-8a06-8a5ff08295b2	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:10:28.999
1ec11cd0-e5e9-4b82-9cd6-efc283106b47	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:10:32.971
cacfd96e-25aa-4359-945c-9a9b2d61d5ac	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:10:34.839
60729170-28b0-4bae-bbb0-90342d9534c4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:10:37.378
6e6ad872-52bd-4b3b-b0aa-deb7ed05e2f1	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:10:39.343
85744aa6-1783-49cc-9028-b10bb91766dd	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:10:41.973
0cf62df6-3640-4b0f-a2e9-58577774a307	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:10:43.915
5eeccaef-d954-4741-a3f5-e3536b33b21e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:10:45.931
9daa1ae3-4f96-479a-b0db-6f2a95b72aec	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:10:55.838
61755a7e-b7a9-416a-9ca3-a6be36a6ed0e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:10:58.018
3a6288c8-2c1f-4299-ba56-eb76009ab239	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:03.079
e2e31251-d492-47fa-98f0-872ef5b2c029	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:05.144
93350a7e-d2de-4fd1-ba8d-421d9b0ed1d5	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:06.848
1beb93f0-e704-4c78-8ede-07244fd4561e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:09.327
96eec8ac-a8f7-4bf1-94a9-f7ccb59fd8ba	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:11.471
400bc96d-dd6f-4b71-964c-40dc253bf062	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:15.186
4702d08d-8913-4385-aa75-f963576301fc	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:18.055
6f74902f-d6f8-4e8b-825e-ec8b8123871e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:20.318
2737624d-6fcb-4f24-9162-db5670c4892f	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:21.94
7d072da1-da88-449d-b696-c8d0c49e8a95	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:23.472
f18285f4-ae44-4ed0-886a-451d9e60d199	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:24.852
397013e1-589f-4718-85b9-dbd962eac4f1	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:26.699
49913f9f-8489-47ad-8d1c-4296af4179e3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:28.804
1482e8aa-2b45-4f6b-856e-b6069dbc594d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:30.851
1cbdd893-b508-4131-bc84-16c347ebf93a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:32.289
c6441626-d46b-4593-8908-6d298f66f49d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:33.845
ee179b8f-0a2e-4e57-9271-f5c76e865999	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:37.185
70248dd5-4b35-47df-9776-9aeb494fcc1a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:39.327
a08f82c4-003b-4b9b-bd0a-057d67486552	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:40.969
657947af-48f7-4eec-9495-c7173cd349cb	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:43.663
65750668-855b-4fc3-9cbf-3f5efb560775	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:45.349
bf8994a5-9ba4-43f3-927b-546287f62748	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:46.914
c8850c66-f9e5-4b66-882c-938cda172e63	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:48.466
5fea55a6-335d-4ed0-9eb1-0c1df9cda6b9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:50.087
5a386f86-9c28-4969-b874-85a3466f3eab	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:51.897
acb1c2b7-ac79-4ad6-b839-245a1f5fc2b4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:11:53.972
f763b0a9-f849-4f97-8547-1040352e2d43	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:11:59.451
c81f3bf1-ab4e-4970-8b27-d8d96b204373	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Noida	India	2026-04-30 14:12:10.253
4e581a20-38e5-4cb9-88c4-f653ab3ca402	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 08:12:12.684
7e721398-8b26-4ba8-91c8-df3fa0084608	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:12:10.254
93153834-40b0-4881-af65-62dec0dfc484	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:12:10.256
5efda6e7-cad3-4142-b782-b62bedf08df5	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:12:12.312
32e98b5c-a85b-43b9-bd39-bdff56013bf8	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:12:13.984
2c81c537-7625-434b-affc-5131bd963176	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Noida	India	2026-04-30 14:12:13.997
d1a596bd-5cc9-4a13-8d41-69ee60b5b23a	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:12:14.039
ec952133-0848-4051-9d36-bb8d056b845f	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:12:15.517
6649fa08-2612-45bd-bc4b-ee9b2002ccb8	product_card_click	/products	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:18.956
b146c7e8-adc3-4ca8-8f53-b4e119df9bb6	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	desktop	Noida	India	2026-04-30 14:12:19.027
6ea1b160-6ac4-4cdb-8c2d-570ddc47160a	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:19.063
8744fd08-7c62-4c7e-8a1a-ce34d9f8b9be	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:12:21.135
ae9d7daa-bf63-4007-ba2c-1ddc5bffb73b	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:22.774
6c964591-43bb-48e0-b844-aaf76a4eff3b	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Noida	India	2026-04-30 14:12:22.782
87c9373c-1ba5-4ce7-90ca-dfd0ac2d7f00	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:22.818
1cc8ae69-f8c5-40d1-a9a9-15216633f5a0	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:12:29.471
7e9c432b-1c10-452b-9c27-ca1b13208982	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:34.077
6a95b22a-8a7f-498c-b975-643ed8c157cd	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Noida	India	2026-04-30 14:12:34.091
17237310-da49-49ad-953f-227c8c4e364e	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:34.123
eb25183a-3988-4c30-b883-f4d474a7cb1c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:12:38.679
35627a41-2226-4a01-8d22-d5306d1c56c9	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:40.071
7b04405c-1492-4649-884b-53017d8d5d84	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-04-30 14:12:40.141
f88d41f1-8ee5-4203-ba84-0ffaeaba8ef6	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:40.185
17ee16a9-d7bd-4b7b-bd1e-4d1ac9499594	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:12:55.304
da76b854-9f77-4d16-96c0-f53b474eadd6	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:56.982
28de77d7-4081-4f23-8232-b238ff064f53	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:12:57.066
2ad4e0e3-cbad-455f-b899-36cd21b568fc	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-04-30 14:12:57.067
7b82f2d1-06a5-47d1-9387-44130e0bf657	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:13:00.231
4459bffc-68dc-4d30-9ada-2e5de428bb2b	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:02.423
5ba1ccc8-b061-4d42-9c46-cc0aa0a3dc06	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	Noida	India	2026-04-30 14:13:02.507
78523208-b40e-48f6-8640-a84e002e0d61	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:02.508
d571df7a-95d0-4813-a05a-58fc9e1431b6	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:13:19.967
5ca78309-67b4-4205-bf90-49dd005ef3e7	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:22.361
02d0d52c-4b1a-434a-99b2-3a22624025af	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	Noida	India	2026-04-30 14:13:22.431
99596d81-1706-43af-88f6-1a8302a97aaf	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:22.464
9954bc12-e44c-4e43-9748-3f2ba83b55f7	product_card_click	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:28.729
3e6ca635-8c62-451d-a25a-6d14731bcb19	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-05 09:42:09.387
f4c489a5-e10c-4c7c-8d4c-05b1eac9f716	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-04-30 14:13:28.73
aa4ead7c-d843-46d5-b456-1f6a5dbfe590	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:28.747
544a7f6c-8974-43f3-a17b-bfcb50b996cc	product_card_click	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:48.335
15222099-27fc-4268-b64f-adf742e45beb	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Noida	India	2026-04-30 14:13:48.34
5649e09f-a927-4032-9150-e7c9c84774fb	product_card_click	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-30 14:15:53.708
788738c4-f509-43a4-bb30-53e6cd0c2d2d	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	Noida	India	2026-04-30 14:16:46.569
6aea075d-26dd-43e9-8b7d-b3f3f82e8d13	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	Noida	India	2026-04-30 14:17:00.829
1b36e65d-ad4e-46ba-b30f-e69c90a095e9	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:00.841
7656a00d-fa79-40ae-bc03-1c66c7977569	product_card_click	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:06.45
d1817061-2e65-4728-819d-223d6f489480	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Noida	India	2026-04-30 14:17:06.461
80f95c07-dbb6-4390-b769-9a2ee5b9e2a3	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:06.473
193e49f2-47e5-438c-adad-6d81f4285fc6	page_view	/	{"path": "/"}	mobile	Ghaziabad	India	2026-05-20 22:14:41.087
ead6e189-2bc0-4185-b804-27bf73a40d3d	page_view	/	{"path": "/"}	mobile	Social Circle	United States	2026-05-21 03:11:54.987
9936e512-e57f-41fd-b874-fd57a031190e	page_view	/	{"path": "/"}	desktop	Newark	United States	2026-05-21 07:41:53.562
1cf84e43-c813-41ca-98c4-04900153a29f	page_view	/	{"path": "/"}	desktop	Groningen	Netherlands	2026-05-21 13:49:13.25
2a71be29-df56-4cf9-a45e-94a50cb0dfea	page_view	/	{"path": "/"}	desktop	Ashburn	United States	2026-05-22 13:36:35.782
741121a5-3630-4d75-8248-b6c3c43eff56	page_view	/	{"path": "/"}	mobile	Paris	France	2026-05-23 08:50:21.743
df7bd7f1-48f8-4030-b1cd-2822c26c4b02	page_view	/	{"path": "/"}	desktop	Newark	United States	2026-05-24 05:40:33.311
fd486d1d-55d5-48af-b107-eb9cb1e2149b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-24 22:41:13.733
a90b8123-fa91-42a2-b83e-4d2bfc11f00c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 07:18:45.902
46469a3e-23c1-4d92-89f5-158c7ed38ee7	page_view	/	{"path": "/"}	desktop	Ashburn	United States	2026-05-25 12:04:18.838
3d1dde22-8090-4601-979d-b6ee08fc8ac5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 23:28:39.907
2a80ae61-df02-4c9a-935c-be82b34ac569	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 02:56:41.67
50f5edad-6018-4ec2-9be8-014632bbf264	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 05:42:31.309
764f38cd-a941-4f81-99e8-8e1f016d3d51	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 06:43:02.076
e652c880-fe35-4af3-be68-51cc96fbb310	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 06:43:08.973
3a6425bb-227c-4f90-bb28-22b26b8e32b0	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 06:43:08.979
b0119ba4-1a82-4915-a271-ba5919ab026d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 07:59:37.68
5d3f6bda-700f-4fa6-a0e2-cc97dd035533	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:00:44.043
14d08aea-495e-4eb2-9590-7ee4615ba60f	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:00:44.124
6d2ed590-5372-4ede-890b-6d210584e35a	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:02:46.161
c8769c62-8984-4267-bd34-c9e8449c73a4	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:02:47.362
19dfbac7-3787-4a36-8186-c645d195c8c3	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:02:54.561
bf550428-11ea-4f66-883a-3eb96e6e2229	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-26 09:02:54.563
e5a9b075-651a-448c-b01b-3fc26891074f	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:02:54.563
95f57d8e-844b-4408-a3ad-334181850c89	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:03:02.663
1a8fb11c-3d72-4315-88b8-0bd2837ee708	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:03:05.985
cd9bf619-5e37-47dd-ba6c-6cb38eae6ab9	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-26 09:03:06.047
ff1f38de-b1ee-4ebf-a3e4-a604c876e842	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:03:06.08
b2d00fd0-027e-4df6-8529-81f616350f42	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:03:08.383
55591461-8d73-4f1f-89e2-48dc9bc64889	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:48.341
42dc5505-643f-47ac-890b-6af55106d233	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-04-30 14:13:51.377
38552774-266e-4dc8-9697-ec22b846172a	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:51.441
0e5454d9-41dd-4a6c-a5e2-569a33d0aa03	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	Noida	India	2026-04-30 14:13:54.674
ef3b4fd1-2d22-4069-890a-b384e3ff2989	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:54.692
35b79361-da4f-4dfa-bda2-b5aee7e0a471	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:13:56.548
28502f48-ca0f-492d-89c0-e1e7f62f56ae	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:58.338
41b8195e-cc7b-4a32-bce7-ce01556b45e4	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	Noida	India	2026-04-30 14:13:58.352
27e1d24f-3587-4d2e-83c3-67b67d766655	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:13:58.422
aa10254f-0037-445b-b7af-6bd42f9f4ade	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:13:59.957
08d57f1a-a429-4c29-bb9f-8d0b790df73e	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-04-30 14:14:06.029
3eba1b5a-0556-4990-9fe7-1e3068f052e8	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	Noida	India	2026-04-30 14:14:06.036
559a0bc8-a56d-4c9b-a492-7beba5c643f4	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-04-30 14:14:06.05
9bae593e-f65f-43da-a015-17c51d86aa83	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:14:08.507
73ff29b2-5264-4da7-926b-70f1899083bd	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:14:10.31
74340bde-e0a3-44cf-bb95-e9e7cf1b2979	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Noida	India	2026-04-30 14:14:10.376
46019de5-1545-4c98-845d-133245b89fb2	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:14:10.414
9da3e34e-5eb9-45ab-a88a-e19fcf415b9c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:14:13.858
5e0b34ed-46f2-4b86-8628-37742f90c1a8	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:14:16.868
172feec6-d1ff-43ae-ae1a-0cd7f442cb3b	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	desktop	Noida	India	2026-04-30 14:14:16.949
35eee94d-1cdb-45de-ab7b-c9c6eb6abb13	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-04-30 14:14:16.991
e9321541-e83b-4a99-ac55-fb7a5fef92b6	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-04-30 14:14:20.156
4f438fa8-5a82-4b1d-b69b-5761d714d4a3	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:14:22.903
22825ae8-f8fb-483a-a6f5-a1d10cfefe18	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	Noida	India	2026-04-30 14:14:22.974
80aa8245-cd1c-4124-a6b2-5a0299c69d36	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:14:23.018
a28f6c91-af1b-41e2-b391-63dacdfb5dbd	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-04-30 14:15:53.707
e1353e0a-b88a-4f58-90b8-c9525e6bc06c	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-30 14:15:53.709
44a3a515-647e-4ffd-8b46-40730a0505d8	product_card_click	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:16:08.079
a47114d2-7229-4731-9670-8db29b032009	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Noida	India	2026-04-30 14:16:08.083
0405b28a-4381-4575-9739-91539a80f8e8	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:16:08.104
b389e511-7c20-44b0-af00-bdd600f05e0d	product_card_click	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:16:46.563
8707dd03-0661-45f3-aabc-fe7688d210c1	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:16:46.606
44f1b4b6-09f9-4415-83de-48a159e17a95	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-04-30 14:16:52.174
d95ecb9b-5e89-4152-a30d-e6fa79c3b46e	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-05-03 07:52:37.443
84369e8d-a495-4de1-a417-0c6d00d50552	product_card_click	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-30 14:16:52.178
395a1765-5d33-47b4-a870-53f9577b6b9b	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-30 14:16:52.181
fa924a60-bb5c-4456-8431-87d277fa73d9	product_card_click	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:00.828
7588b7dc-35c2-473b-a147-7f1a1adb5322	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-04-30 14:17:14.765
c92905dd-68d7-4eb0-a888-baacc6c5976f	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-30 14:17:14.773
56e84286-e9a3-4e37-b2c7-0a73705e1f0b	product_card_click	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-04-30 14:17:14.756
85c1413e-abb9-4f5b-b2d1-7aeb269d0962	product_card_click	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:21.438
6d125aa9-1ff5-4d78-9abe-c8afd413949a	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	Noida	India	2026-04-30 14:17:21.441
0d49dbc2-cd59-442f-a1fa-69cd7071cc81	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:21.45
60d44c4c-2bef-4e41-831f-92c514860434	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Noida	India	2026-04-30 14:17:31.219
c45b349c-69b3-421f-92b1-42f67e217f00	product_card_click	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:31.222
818f68d6-3dc5-444e-b8be-fff64c72b92d	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:31.224
4ca6d522-7d62-45fc-95ac-56f3f1aab8d2	product_card_click	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:42.301
ddc484e3-c779-4c93-a5f3-d2845a14f868	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:17:42.327
da9f3c4b-a1a1-46aa-a9d3-9be791f3451c	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	Noida	India	2026-04-30 14:17:42.328
3b91717f-3572-4e22-82f1-a4fc285224dc	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Noida	India	2026-04-30 14:20:36.451
83ac6e3f-3259-41b3-82e6-7d1e32ab5628	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-04-30 14:20:36.483
5af1291d-a739-4971-bbd3-d5d0ccba57f1	page_view	/	{"path": "/"}	desktop	Noida	India	2026-04-30 14:20:39.237
22c508be-9ed6-44c3-9b92-48fa33eea0f1	page_view	/	{"path": "/"}	desktop	Beauharnois	Canada	2026-04-30 22:38:19.357
03e51721-de31-469a-bb6d-905eec3a77b8	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-05-01 01:07:44.845
774c4b2b-cace-4350-b27f-16fe21ea73f1	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-05-01 01:08:28.236
f0c57558-27d5-43cc-8efc-f909fdbbc147	page_view	/products	{"path": "/products"}	desktop	Council Bluffs	United States	2026-05-01 01:09:00.363
7a88f463-6f30-473a-a369-580a66f1fa45	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-05-01 02:13:29.069
8c8e0293-389e-4bbc-9d12-9f0e24fd1a5f	page_view	/	{"path": "/"}	mobile	Fatehpur	India	2026-05-01 07:26:44.829
5b15fb61-fda3-48c5-acb4-0612c52bdf5a	page_view	/products	{"path": "/products"}	mobile	Fatehpur	India	2026-05-01 07:27:12.18
9f16b758-0a59-4f6b-aba4-85a33e9ce9a5	page_view	/products	{"path": "/products"}	mobile	Fatehpur	India	2026-05-01 07:35:06.69
a411b665-b150-45e9-a46f-b38c8cf80f30	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-01 08:15:37.739
2ba6b0b7-3e56-4dce-a317-f883daf3802d	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-01 08:15:56.279
727207ba-260e-4a21-a8a8-fe30a55fe5d4	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-01 08:15:56.711
7a26ac69-8b3b-48c1-9424-8077f2c28ad4	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-01 10:49:17.463
f58fb6a3-0c12-4997-a4ec-5c54c7701185	page_view	/	{"path": "/"}	desktop	Council Bluffs	United States	2026-05-01 15:16:46.222
0f13b961-4d35-4c4e-9c39-a640a2f1ea08	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-05-02 03:17:01.283
b34bce87-7c45-46be-9788-0bbce6d766bb	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-05-02 04:22:30.854
9752628e-8115-425a-94b7-277993dbd826	page_view	/	{"path": "/"}	desktop	Burnaby	Canada	2026-05-02 10:27:52.442
69ada93a-bec1-4f21-98ef-170675ea3689	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-02 11:33:03.819
8c1bfd09-d343-43b7-b9b6-9420e6859aa4	page_view	/	{"path": "/"}	desktop	Council Bluffs	United States	2026-05-02 16:03:39.681
1bb8d5cb-13ba-4ad9-9577-e3466e420c80	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-05-03 02:07:47.472
cb7fad06-7770-4732-aa44-8d25f3c8e482	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-03 06:56:24.548
d88cf800-2001-4d41-9e98-76b9c464b928	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-03 06:56:49.928
f89e6873-11dd-4310-ac0c-bad309425edb	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-03 07:35:06.964
a7380993-7320-419c-8ef1-ff22bd09c468	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-03 07:51:46.698
a290de21-f24f-4765-96f3-32844732484a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-05 08:12:01.705
1a07fedc-3d36-4562-aad4-7b3d05de3172	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Delhi	India	2026-05-03 07:52:50.967
3ce3a3e8-ef28-44de-a5c7-d731d05fab60	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Delhi	India	2026-05-03 07:52:54.487
f7a29ed2-0af7-4233-9276-257e0b9f21a4	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Delhi	India	2026-05-03 07:52:56.453
b9153705-0c73-40ec-9876-bb2ae7018654	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Delhi	India	2026-05-03 07:52:59.351
735875e6-52c6-4d75-9dee-aac50ad7973c	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Delhi	India	2026-05-03 07:53:21.263
3fa7f9ce-9307-49dc-8edf-0c0249eea55c	page_view	/	{"path": "/"}	mobile	Noida	India	2026-05-03 15:57:40.27
b9074ffb-4300-4863-913a-96e6c61b6bf8	whatsapp_click	/	{"source": "hero"}	mobile	Noida	India	2026-05-03 15:57:44.82
c6a00a7a-43a4-4a3e-8422-6643dc412cb8	whatsapp_click	/	{"source": "hero"}	mobile	Noida	India	2026-05-03 15:57:54.477
20fd3568-7ca1-4798-91cd-24b0490870a1	whatsapp_click	/	{"source": "navbar_whatsapp_drawer"}	mobile	Noida	India	2026-05-03 15:58:15.301
a8914175-db1d-46a3-8570-3ef91865ebee	phone_click	/	{"source": "navbar_phone_drawer"}	mobile	Noida	India	2026-05-03 15:58:31.309
808ac147-57ef-48be-8ef3-7eaf0880cdbc	whatsapp_click	/	{"source": "hero"}	mobile	Noida	India	2026-05-03 15:58:46.874
6f18f4f9-95a2-4513-a8f6-de608f39e657	whatsapp_click	/	{"source": "footer_whatsapp_block"}	mobile	Noida	India	2026-05-03 15:59:01.241
f179d0c0-4ad4-4634-8bf1-13a88a0337c0	whatsapp_click	/	{"source": "footer_contact_whatsapp"}	mobile	Noida	India	2026-05-03 15:59:11.217
cf70c420-79ab-4943-92d3-a2e05f0d6d7e	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-03 17:44:22.612
422936fb-ca9f-4e2a-a616-195d91a33c23	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:44:29.371
acacbe77-18cb-4daa-a6c2-92d6e55d202a	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-05-03 17:44:29.413
7a063f37-b0db-4a0b-a11f-9441adcb79b9	product_card_click	/products	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:44:34.332
1871232d-ed60-4c0c-8f20-ae7c62699f44	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Delhi	India	2026-05-03 17:44:34.341
5606f2bc-38a0-4aec-a4c6-4453916e40a7	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:44:34.384
128c6063-998c-48a9-881e-6a6b6b9d9449	product_card_click	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:45:08.335
506284ee-e253-4ec2-be31-7d1a6817204f	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Delhi	India	2026-05-03 17:45:08.344
6232b966-6cf4-4664-add3-1de60c8c8b2c	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:45:08.347
36af3c9d-76af-45b5-a0fe-0c5f29fd4f27	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Delhi	India	2026-05-03 17:45:59.587
d04d145b-e875-48b2-8f55-ef00e873f792	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:45:59.588
55d23f86-1b9a-4e50-acf5-52ce1b55f817	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-05-03 17:46:01.465
c0e128b1-32e5-4ded-ac10-d477ba0676ac	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:46:22.71
f9aaea62-59e4-4179-8208-16decd12b29b	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	mobile	Delhi	India	2026-05-03 17:46:22.711
0f8fa1c7-6245-4403-af4e-29419d446aab	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:46:22.733
d1eae27e-0525-49af-b812-df336cc6bd01	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-05-03 17:46:43.766
4965488a-26fa-4a58-a5e2-dcd923521ab7	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:46:46.193
3e499397-7b28-49c6-ac2a-721d27ce0c21	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-03 17:46:46.268
3d315376-ab4e-4fe4-b960-10501dfef6bb	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Delhi	India	2026-05-03 17:46:46.275
4ee07b87-11cf-4332-8db1-c1fd1a3f8cd0	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-05-04 03:06:49.123
3bf6fe40-e17c-4173-b065-99c2d81e9807	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-04 07:04:32.12
993e2c06-0e71-4c37-9551-4977884696d7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-04 11:40:19.352
1ddec90b-0f48-4ef4-87e0-46e9d9caf498	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-04 12:36:29.44
9dc2a4e4-b65a-4e8d-96dd-4c7b787551be	page_view	/	{"path": "/"}	mobile	Meerut	India	2026-05-04 15:30:24.792
2d224cc6-5432-44c5-b6b4-2ee59513aaef	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-04 17:53:01.312
413a3a06-3c07-4fd0-b7bd-5896f5edc9d9	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-04 17:53:22.234
c8155806-63f5-4ee0-8b49-a139865273c7	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 05:55:59.275
548d56bb-c878-42bf-94db-d6881b18d059	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 07:49:47.811
9d296691-84d8-453e-a97a-5f22d6334b5a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-05 07:51:05.143
b407549d-e171-46cf-96d2-ae4039983a57	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 07:51:11.846
e34d65b4-0c32-4252-b2bb-d63a402d74b4	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-05 08:12:01.654
a3414cb4-366a-47de-a2cd-fde38fc565f4	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-05 09:42:11.887
5be31d38-ad39-4db8-ae84-5c2e42b5f04d	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	New Delhi	India	2026-05-05 09:42:22.555
41199652-5270-4a80-8ed4-b7740fe07eb8	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-05-05 09:42:22.559
39e1dfd1-51a8-4973-ad8d-a7158ff6e630	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-05-05 09:42:22.556
e9c7fa3a-f3d2-4c75-a699-4c189535278f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-05 09:42:30.675
de6dd7d2-d783-4859-93f8-394ca1665423	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-05 09:42:34.069
fce50f9f-92d3-4f5d-8404-3d16c06506ae	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	New Delhi	India	2026-05-05 09:43:59.344
e9a4e872-e58e-4acc-a937-552326a178e3	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-05 09:43:59.413
30ff3d31-f12f-4888-86c2-c1bbfccd2259	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-05 09:48:18.016
8137cde3-770c-4f7f-a39a-c0e2acf4c9cd	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-05-05 09:48:19.775
5398745e-ce12-48b7-b0f7-8beb1228f7fd	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	New Delhi	India	2026-05-05 09:48:21.159
191cdc5a-5bde-41e7-b6a9-3a4364eecfac	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	New Delhi	India	2026-05-05 09:48:22.343
d7b3e9d8-d793-4b29-a112-ba45b73db7ca	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-05 09:48:24.253
43b77b4c-181c-42a6-9063-3e949e747c11	page_view	/	{"path": "/"}	tablet	Santa Clara	United States	2026-05-05 12:30:19.892
1472863f-a297-4e0c-9b7c-d6901c112fa6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 13:37:08.151
f6eeb534-28a2-4996-900d-194a06877362	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-05 13:38:41.147
3ca19029-52a1-457a-a0a3-fd1c7e0f50d9	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-05-05 13:38:44.235
19ec0e03-f94a-46f6-ac88-074ea10d1359	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-05-05 13:38:46.538
2abd4ac2-a0a8-4898-9f7c-942ea35dca50	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-05-05 13:38:50.054
f64d54dc-eb69-4048-8d52-ea9d4d16ed96	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-05-05 13:38:53.584
0248ad7f-bbb1-4cdc-9001-efffbc39e54b	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-05-05 13:39:01.501
80dc56bc-1b81-4c85-bf87-04b7c3e50a10	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 13:39:09.281
e84a4527-8a92-4f6d-aef6-b0087c62702b	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-05 13:53:12.66
e703901e-619d-484e-9489-bab52d3aaa0e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-05 13:53:12.708
6a39bb25-0495-471e-8f6a-c821212623e6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-05 13:53:18.463
3fe5ed78-8c12-4418-ad2d-0181d295443d	page_view	/	{"path": "/"}	mobile	Noida	India	2026-05-05 16:54:25.779
89e281be-8b3f-4fb7-b5e7-d81cc734a139	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Noida	India	2026-05-05 16:54:28.904
a1a35845-a40c-4eea-8b9d-a8dda3b6cfc4	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:54:28.967
00a8f469-9a1e-40cf-957b-88a0173e4d7a	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Noida	India	2026-05-05 16:54:33.027
f9751c54-534a-48cf-8eb6-9ba087a16a62	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	mobile	Noida	India	2026-05-05 16:54:33.096
008a15fd-70ab-46e2-8fc4-c1a2f538b97e	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Noida	India	2026-05-05 16:54:33.122
0182298a-be51-40d7-a687-cf1dea12d6f0	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:54:40.505
b1e521b0-6533-4dc4-a50e-99e7b9ebb652	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	mobile	Noida	India	2026-05-05 16:54:42.362
351a8931-f83a-48ba-95b1-3aa39ca0c88e	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	mobile	Noida	India	2026-05-05 16:54:42.475
97b786d0-f6f2-4439-aec2-2b010cf80f9e	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	mobile	Noida	India	2026-05-05 16:54:42.477
842780bf-22b8-424c-a1da-c7402efda570	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:54:49.773
7d05558d-8733-4f66-b2b4-129c6e5af7f5	page_view	/	{"path": "/"}	mobile	Noida	India	2026-05-05 16:54:51.301
4d994e54-f02b-4103-a466-08ef1f024a22	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:54:54.337
c326db8e-13e6-4a10-a2b8-5ff696c1a960	page_view	/	{"path": "/"}	mobile	Noida	India	2026-05-05 16:55:10.402
0fea3567-c930-4e60-8c74-d1851b98a53e	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	mobile	Noida	India	2026-05-05 16:55:15.696
4b0ec57d-5cec-4631-bfbc-82534c8d723c	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:55:15.726
da70f6f0-0554-4eac-845b-b8eb5c2aaf6b	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	Noida	India	2026-05-05 16:55:17.821
382afa51-a9b7-4d08-83e9-310051c57475	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	mobile	Noida	India	2026-05-05 16:55:17.843
0637f36c-f5e7-4e26-a0ff-5adb3c5c924e	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-09 06:08:42.891
23b88ac5-9cb7-4e98-a4b0-083ad0780f38	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	Noida	India	2026-05-05 16:55:17.894
d6747fea-1727-47f3-9151-7080657099fe	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:55:28.704
96e3b915-e69d-456b-b0a8-e0a9aeec35cc	page_view	/	{"path": "/"}	mobile	Noida	India	2026-05-05 16:55:29.809
a2f5aa85-967c-44d7-80ba-c0b4f3ca6857	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-05-05 16:55:40.748
dc2b3de8-1fcc-4694-a3e2-eb9125d3c502	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-06 01:55:51.523
f7e6681e-4886-4ff6-8fd1-099ad09b3242	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-06 01:57:07.68
0cfd158d-53be-421e-851a-73c25f391ba6	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-06 01:57:11.251
15320d6e-3596-4506-b3f9-e0200eb2c11a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-06 01:57:11.37
90730a5e-2065-47df-9290-c56eb4fcfb6a	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-05-06 01:57:13.1
3d3c9f45-8019-43e4-aec5-ab2f374fddd2	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-06 01:57:13.104
c058f819-5df4-4e8c-8188-dcfeee932cb5	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-06 01:57:13.166
db1b62b9-e976-42d0-929d-b70a1199892a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-06 01:57:52.399
a9880282-dac5-45b2-bc67-b6189bd6fc8d	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Noida	India	2026-05-06 01:58:12.685
af3bcf08-6c4a-4273-bc64-9a28c56e761d	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Noida	India	2026-05-06 01:58:31.574
015970ed-78ba-49cc-a9fc-bd86b98336fa	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Noida	India	2026-05-06 01:58:38.739
1d4944f4-593b-4c16-8e1a-ae5ad2b02600	whatsapp_click	/	{"source": "footer_strip"}	desktop	Noida	India	2026-05-06 01:58:50.774
161ff362-0508-4c51-8af9-adc1448dc12c	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	Noida	India	2026-05-06 01:59:10.327
142d6302-2911-421b-bc5c-670d3add5c0a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-06 03:53:26.283
7a7b19bc-6a09-4d3f-bf21-110fefe19858	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-06 03:53:46.803
15dea089-1e96-4569-b84a-e93e3876e50c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-06 03:53:46.806
46eb1437-6439-40fa-9b9a-a86a441a020f	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-06 03:53:47.833
fa980049-6e65-4ecd-94c1-ff8f116a6c86	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-05-06 03:53:47.845
ed828c6e-65cc-4e0d-b80a-3a5b77baefa8	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-05-06 03:53:47.955
f07d9bcf-2904-4665-be21-a74e5a09c5fe	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-06 03:53:53.304
9eaf1261-384b-4fb3-b1ce-e1e8af4f10e9	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-06 06:27:38.732
00364805-94ae-40f6-8a63-2aaf61cc4926	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:27:45.326
88351f75-c158-406d-9abb-6ae4f361f549	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:27:49.232
00e45497-fb05-4a43-acd4-122542f91120	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Delhi	India	2026-05-06 06:27:49.305
3dbe8a4d-9778-4321-84c4-e8c62a7eafed	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:27:49.359
82a06011-82c7-44b2-95a7-afed1996fd64	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-06 06:29:16.297
58943430-0e7c-4b3e-8a81-149c97467a50	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:29:17.655
5be28a58-8373-40c8-97ea-c427cab9f847	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-06 06:29:24.698
32403203-b2f4-4df9-a3ec-24addf59d4b7	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:29:24.707
9df39ecf-fe46-46e8-9775-93abcf6bdc65	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:29:24.709
202276f9-ccf9-4d17-8231-a60e6d416c20	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:29:31.133
78a0888f-1f39-44b5-98a9-c38551359292	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-05-06 06:29:36.234
3a5764fe-faf3-4a8b-8fda-b25f3535edfe	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Delhi	India	2026-05-06 06:29:40.014
6bd522b9-3034-481b-93db-27f237b770a9	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-06 06:29:41.947
dfe9d6cb-68b7-4a08-9de5-9c3722e465f0	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-06 06:29:42.036
0ee68508-3fc7-49bc-affe-565e1f4cd856	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-06 06:29:42.041
30fea0b5-a60c-4a88-90dc-21491143318e	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-06 06:29:51.689
59c82452-70ca-423d-8cc0-dcf17f03f7d8	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:29:53.765
7a05e99d-aa82-49cd-b6a0-e1754346e113	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-09 12:52:40.579
2a29b306-d567-4ade-9d2f-01fc5be548c6	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:30:00.291
02b8989f-0158-4c64-acb4-661590f41a5f	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-06 06:30:00.295
a1fa2fd8-8b14-4a5a-b4e9-c559c9bf5da2	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:30:00.292
b4b0a5ed-b4b7-4dfb-8b54-9f4c0aca0a85	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:30:13.652
c5f61486-f94e-4ff4-a0f8-c56b5bc9ab67	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:31:03.924
972f5ddf-d88b-48b7-95af-74d2e295c84d	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	Delhi	India	2026-05-06 06:31:03.939
5aae4e07-0464-4587-b67f-ce22bda7452e	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:31:03.942
f1207920-45f9-4157-8a61-5fc6a5e10596	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:31:48.652
dde7c2cd-2567-4921-8756-b9854bbc8c49	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:31:51.115
074e41f7-28b1-49c8-ba6c-4bb47feadd2b	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Delhi	India	2026-05-06 06:31:51.186
b70075e2-e18b-42f0-ba07-5f0bdd724e7f	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-06 06:31:51.23
f793b3a3-1d49-4c64-b04c-e9145e7a2273	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-06 06:33:44.852
530d8b02-b048-4a41-9282-3fc41330c1d3	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-06 06:47:32.65
044f8ff7-c177-4377-bddf-d5db6d94a8f4	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Delhi	India	2026-05-06 06:48:57.159
ac024944-281b-4678-ba97-db384a651765	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-06 06:53:49.518
dba0979f-3781-47bd-9bae-a8cc575888ec	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-06 12:44:39.226
c88769a6-415e-4868-bc13-821427ace5ea	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-07 03:30:26.512
b1bcb350-0a29-4588-9274-32ebb8a65681	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-07 03:32:02.906
bc37bbae-4196-4748-a3d6-5bb2d9185edc	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-05-07 03:32:02.915
1f492754-f9e2-46fd-a86d-e5e52990519a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-07 03:32:09.171
57bbae16-5b3f-4d94-b7f4-7eac6bfdecc8	page_view	/	{"path": "/"}	desktop	Noida	India	2026-05-07 03:52:52.62
609ae694-938e-4735-a9b1-b940d2e9dad5	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-05-07 03:54:04.021
d7b2111c-3311-4a0d-bd1a-ca7d123cdf1f	page_view	/	{"path": "/"}	desktop	Dublin	United States	2026-05-07 03:54:26.591
725b7b1e-b7bf-4003-a23f-0df5c97021f9	page_view	/products	{"path": "/products"}	desktop	Dublin	United States	2026-05-07 03:54:28.881
d80906fc-8694-4944-b0e8-8d131980af7c	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-05-07 05:23:27.076
a4528a2d-2c63-42ec-81e6-093c5b1ce184	page_view	/	{"path": "/"}	mobile	Wainfleet All Saints	United Kingdom	2026-05-07 07:40:31.988
b6f8d6d5-4558-4e51-9503-c65eb0e76e04	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-05-07 07:56:12.579
d2385218-9a0e-4e08-be5e-5a5b9dd80582	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-07 13:01:01.947
a17fccc3-f542-4231-ab29-8e88bdc14b77	page_view	/	{"path": "/"}	desktop	Nāngloi Jāt	India	2026-05-07 13:36:15.528
6cffec73-efd2-4864-a33f-f46dfafdaf1d	page_view	/	{"path": "/"}	desktop	Ahmedabad	India	2026-05-07 13:36:15.537
111cdf74-026e-4c73-8195-d25068a7be8b	whatsapp_click	/	{"source": "hero"}	desktop	Nāngloi Jāt	India	2026-05-07 13:36:22.052
304c3e25-c5be-4b21-9572-dc65642f8f7d	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-05-07 13:36:26.629
7889c02c-7dc7-4136-bd0a-edcc2fe5b399	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-08 09:01:08.363
fe2bf7b1-4cf5-4ab6-a0b7-2222b3d333d4	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-08 12:14:40.047
efd279ef-0af2-43fc-9efd-7dddd060458e	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-05-08 12:14:53.901
208d3e60-728e-43ef-98fd-a383f63558d6	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	New Delhi	India	2026-05-08 12:14:53.911
b9e27c4b-a803-49b7-9b9c-83b7c27fa8ae	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-05-08 12:14:53.918
191c1873-bb40-4d4f-9ec4-1c747cc7965e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-08 12:15:00.836
31edf277-eef1-45a6-ae23-7693303ebb66	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-08 12:39:37.85
1aa095c7-f527-455b-8198-01ffab3e3f69	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-08 12:39:38.328
68742dba-67e6-43be-ab62-be27ba1a9224	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-05-08 12:39:44.921
8dd8b1af-87da-4185-9989-eb9d1e6e9ae6	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-05-08 12:39:44.928
bb33a9ba-d72f-47cb-ae8a-d08e6973d9c1	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-05-08 12:39:44.924
0a780cc7-bca0-49bc-8d58-2049951c5f8b	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-09 03:40:26.955
32477439-a7cc-4feb-b56f-e566db31e903	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-09 03:40:29.085
271d4a2a-a168-4cf5-808f-24b915cd711c	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-10 05:41:24.848
86c31d36-7986-47c0-ab37-3a3d3f998e17	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-10 15:25:12.607
fe87e1de-bd42-46be-a1d8-09c107c6b6a5	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-10 15:27:05.094
a33341d1-6c2b-436f-b412-50938d5e9148	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-11 06:29:22.426
81b784d6-1546-4cc1-b238-e4451db52e4a	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-11 06:30:27.238
025e4b9c-a452-4fe7-a99b-5c8a07758bb5	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-11 06:30:35.42
d7b6d531-7690-4940-ae77-db8c19fa0cb4	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-11 07:07:47.386
0764438c-1b3a-4b96-ab4f-b41b0e6e374b	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-11 11:05:39.271
9810b3c0-dff4-43ba-abd2-06f0151dee05	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-11 11:05:43.489
4eee87ee-dcdf-46e4-852b-6c563edcf5d2	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-12 12:43:57.313
0af4ff37-a1ce-45f2-a5cb-e5f9a8e58ff1	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-12 13:55:27.804
647ce0e4-797c-4ce2-8b75-166a82a8cc0a	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-12 15:31:30.384
786f9de7-4479-44d0-bb09-c24102792fc1	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-12 15:54:37.682
51da41b8-3ba0-41aa-b4c4-0e0f5496478d	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-12 18:55:54.858
734b0f2e-d5b0-4329-89d2-8c787a7bb5f3	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-13 05:51:24.461
6cc62015-fc83-4be0-8cd2-4b6310ff9a90	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-13 05:55:32.516
2a6c7c74-29e9-4a07-a466-1de55c133d8d	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-05-13 06:35:55.102
9b35352e-05a1-4124-bd7c-0781e71c2e19	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-05-13 06:35:55.135
1e0864e3-6553-4e90-a10b-6d9680a037c0	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	New Delhi	India	2026-05-13 06:35:55.11
605148a1-15b5-4a58-96dd-de62deeabb18	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-13 06:57:07.439
97f77be1-95f7-48e6-bc77-35d0b8a6092a	page_view	/	{"path": "/"}	desktop	Forest City	United States	2026-05-13 07:36:37.257
56eccc2a-9de2-46a4-bb82-196273284b79	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-13 08:05:26.05
a5308726-71af-4b33-9f30-3edb595a7456	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-13 10:34:48.595
196311d8-696a-4831-8256-8efabf1fddf4	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-13 10:35:09.671
9f626523-5404-427e-b799-3b36e679f8af	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-13 10:35:32.927
f50d54ca-3d4c-419e-b1e0-b49d35b9b1ef	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-13 10:35:33.012
b95b29ed-6970-411c-b726-c7c097cc1d31	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	mobile	New Delhi	India	2026-05-13 10:35:33.016
c8c1c930-d6a5-4ff3-98b6-b36bdc9b5700	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-13 10:35:49.22
1a014f35-a09c-4fd4-af7b-247847059e9e	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	mobile	New Delhi	India	2026-05-13 10:36:05.786
62fe7e97-5ac7-45df-a030-9604fea0c315	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	New Delhi	India	2026-05-13 10:36:05.795
0b32a255-c6ea-4454-b5e2-93f782d97b5e	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	New Delhi	India	2026-05-13 10:36:05.787
606f0b60-6a02-491d-a678-212f533d7332	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-13 10:36:11.595
90ffa582-1b3c-4b89-9f66-8da1e8f76973	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-13 10:36:16.344
c095d1f8-8519-4fa3-bccc-a47a3bb18cad	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-13 10:36:34.497
ed32eb09-21bf-468e-ac11-945a3fe10864	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-13 10:36:34.966
7370019e-fa4e-4b49-9839-19e05f24433d	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-13 10:36:45.761
48faf652-91cb-4a34-bf33-fe89a35da3ad	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-05-14 05:25:39.633
8e83976e-8f49-4b9f-bf65-8e3bd6927814	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-14 09:12:37.139
f8044406-8958-4fbd-ae12-3b72387a4fc1	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-14 09:50:42.36
a928b51a-add9-442e-96d0-b85ca0b8df68	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:12:03.715
cc6b5309-a582-4bfb-9272-3593521ca432	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-14 10:12:03.8
27b349fa-5728-4f0e-b887-6f82644492d4	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:12:04.638
c49e2471-2af8-4f7f-901d-269422d5e3cb	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-05-14 10:12:04.726
bb7e21f9-6b3f-46de-bdfc-9c12699a24f3	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:12:04.841
5b9430a8-b1c8-46ab-aa01-6d4cd57abe9e	product_card_click	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-14 10:15:24.616
7242b140-7e34-403f-a8de-bd35de1ab094	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-14 10:15:24.628
9b72b2b0-87e2-4785-9ce2-caf3ec1fb7c3	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-25 09:07:18.595
f72ebf1d-5c2e-48a2-a7d2-adf9212acb77	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-14 10:15:24.619
eb224927-1e90-4199-9adf-7bbb7fb1e38d	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-05-14 10:16:11.831
3ec9625d-3167-40cc-8e47-83e9c86e2214	product_card_click	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:16:11.834
3dd7debe-736f-43b9-ba84-1096aa1d86a6	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-14 10:16:15.001
863dba71-1d8d-4050-8872-6808229cdb3c	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-14 10:16:15.008
8a898534-7ae7-4b56-8848-bbc6716b4341	product_card_click	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:16:28.495
6f1498c9-dcb7-4e81-944b-0ecad5f7edf1	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Delhi	India	2026-05-14 10:16:28.526
22f01b8e-be5b-4b32-bf6d-12196ef0740b	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:16:28.53
15693457-5c24-4b46-9596-94e84253b618	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Delhi	India	2026-05-14 10:17:48.616
51aeb379-2829-4f37-b72e-6c383b19ccc2	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:17:48.632
97ce0e7b-d1a4-481b-a0da-cc0264a17a54	page_view	/	{"path": "/"}	desktop	New York	United States	2026-05-21 01:17:36.272
74f6886b-252f-43aa-9ef4-2ab4a066acc4	page_view	/	{"path": "/"}	desktop	Washington	United States	2026-05-21 04:37:53.201
35438469-d458-493d-b978-8462d5fc9311	page_view	/	{"path": "/"}	desktop	Chicago	United States	2026-05-21 08:35:39.48
fef59d36-5a15-4c82-baa8-f4ed335cd14d	page_view	/	{"path": "/"}	desktop	San Francisco	United States	2026-05-21 16:32:56.871
42d75523-eb22-46ba-a18a-3f0cdff178a8	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-05-22 14:11:16.75
b4526f38-67e8-487b-99d8-de307b6f1e67	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-23 17:30:04.188
3d3b292b-cb98-4711-9911-e5aece8a3c2e	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-23 17:34:30.847
c0de66d3-1ff8-4603-b623-00432f084ef2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-24 15:56:35.974
a3cd1f94-3d0d-4146-a3bc-fba6076c36a8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 00:00:03.104
2be213f1-a92d-4362-b165-6cef40592957	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:22.117
c7474560-cfc1-4642-a164-400c2c749e1f	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:08:22.141
2b116f10-8b53-4bcc-869a-ee546bc01d0f	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:24.141
9d7c387e-ac05-4824-af87-cb999b619c7e	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-25 09:08:24.156
a09e68d3-efea-4ed0-a4d4-c0052078cea6	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:24.256
d30cf4b6-3c62-42ef-992f-d2c5f43ccb78	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:08:26.955
fa3d357f-be78-4007-9ef1-e376050bd0af	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-25 09:08:32.343
5a207b91-cbef-4025-ade5-d28dd980288b	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:34.759
de8fc1a1-e7b1-43b6-b405-9608afb293c9	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:08:34.853
d5ee5284-6515-4cc2-8bff-c56055bca824	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Delhi	India	2026-05-25 09:08:39.64
58697859-14e9-4f8b-a5a1-f49870a4b227	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:43.254
eb0e2ea7-a5f6-4c57-a23d-008b213290fe	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:08:45.464
fc4024a7-e08f-432f-b67d-9679f5a28084	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:46.853
071eecff-0886-45b3-a9f6-556244dfe63a	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Delhi	India	2026-05-25 09:08:46.869
c17cbe6d-fcab-4f62-92f1-0b6ba1d4dc93	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:46.919
8bc469e4-4a5d-4c58-a7e1-0198287eb95e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:10:11.808
83967bc6-9cf3-40f7-b860-797729151d95	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:10:15.722
ee9df849-ed0b-471e-ba9b-c63a280fe9fc	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:10:15.794
136cab1f-7b80-4fbe-86b9-72f80dde32f0	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-25 09:10:15.811
24c0c157-b444-4272-9dc2-25bdf98e35f1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 12:16:38.927
4cd49e77-7971-4e2d-88f9-ccff4a3369c4	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 23:49:05.147
6eec9a49-aef4-4696-9d2e-321b93d1e7c8	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-14 10:16:11.832
5c1d7a01-8f2c-49b6-94ae-c215761dff1f	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-14 11:34:30.94
1ae6a817-128b-43ae-be02-a8fcfed22cd8	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-14 12:20:23.728
283e81dc-4e7c-429d-a9d2-d6715facf32e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-05-14 12:20:25.527
d60752a5-5d66-4e88-84f1-82fb3f1d9dd7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-14 12:20:32.409
3672ca2f-61ab-43ed-9f55-1238454d3c36	page_view	/products/8840eb31-4b9c-4870-849f-fac65c4b8797	{"path": "/products/8840eb31-4b9c-4870-849f-fac65c4b8797"}	mobile	Oskaloosa	United States	2026-05-15 00:47:47.053
038cb7f8-8245-414e-b206-9ebfda7b7aa6	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-15 12:58:43.503
19de568c-5740-4325-a48c-61dc3e7ab982	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-15 13:02:39.581
cc6955bf-db0a-4e91-9253-b52766fe0a44	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-15 13:02:55.168
58b9e839-2d54-4c48-84ac-9e47d3fd87aa	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-05-15 13:03:34.28
1ab4b523-0b65-4a0a-9353-cb929ae71f8e	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	Delhi	India	2026-05-15 13:03:41.456
bcb3c489-20d6-4495-a92d-ba5447918f50	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-15 13:03:41.471
7f990421-1e56-40ae-8f39-97615a6d0fbb	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-05-15 13:03:41.457
4860975e-b761-4665-b7f9-8413d534462d	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-05-15 13:03:44.553
1f66c4b9-1d96-45ae-8ce9-4453769ba4ec	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-15 13:03:46.272
4a635cf7-680f-49bf-aff5-4c78c60baa09	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-05-15 13:04:09.574
ee2c589a-7600-4dc5-af7c-1f327adc5a35	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-15 13:04:42.415
02fa6f75-77f0-4184-8b5c-87d2bbae9dbd	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-15 13:43:33.713
3020c02a-6540-4acd-a814-00eeffcf6479	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Oskaloosa	United States	2026-05-15 15:36:59.444
32856d20-89d4-429a-87b8-04b8762ccdcb	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Oskaloosa	United States	2026-05-15 15:36:59.746
ba5ac85b-1150-4649-bea3-121e3b7ccab8	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-15 17:06:55.145
d81308d7-4355-4d18-bb46-e2f73d8cd94f	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-16 07:20:22.646
5c4dc0cb-3a9c-4f3a-8905-7776d028f883	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-16 09:04:43.908
78e774a4-dee7-45ef-9b2c-a7fd5036d8c6	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-16 09:05:23.694
a0779330-5acb-43fa-9d03-12c74fe284dc	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-16 09:05:26.613
3b7ebe11-1f17-4d27-ba12-aec3107c701f	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-05-16 09:05:26.693
b385d20a-349d-4e76-9322-627b906ba731	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-16 09:05:26.773
e850cbf7-c42b-4315-858e-6639c41f65ba	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-16 09:05:30.348
2550f641-0f7a-40bb-bb0a-ab8c9c7ae788	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-16 09:05:32.548
3edc574e-9e52-415d-91d9-e689d1d9ccff	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-16 09:05:32.613
526f0254-4069-4c53-88d0-81950e033fed	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-16 09:05:32.658
8fcd5127-75fa-44c8-98b4-2a155c8fa94c	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-16 09:06:23.335
57fb8b8e-2475-4d99-b90c-1e4ee2db9355	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	Delhi	India	2026-05-16 09:06:38.41
f2bb3f6d-2807-4ccd-8e79-7b8635a23cab	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-05-16 09:06:38.41
e8259ebb-e44a-4981-8a46-935d57709141	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-05-16 09:06:38.453
f6e97503-1e57-4459-9e54-6872fd453748	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-16 09:07:23.613
e2d4747d-5c7a-47be-8878-47eb52482795	page_view	/	{"path": "/"}	desktop	Luleå	Sweden	2026-05-16 09:12:16.849
88265a50-68bf-4fde-8cb5-49e19c01a644	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-16 12:50:06.706
c182b7f4-df10-4e1d-975a-28601ecd1c8e	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-16 13:45:24.617
ed924e85-382a-4f5c-a23d-3a4ebd8fd61e	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-16 13:45:40.414
822dbf84-969f-4b06-b809-4ae31df494f5	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-16 13:45:46.433
c741042e-3483-487c-9d76-a34e516f2f56	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	mobile	New Delhi	India	2026-05-16 13:45:46.439
6ad832bc-b909-48e6-a3fa-d889a288c07e	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-16 13:45:46.451
57a7f638-3402-4c0b-9c31-43388f50e486	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-16 13:46:46.499
63f758a5-91b3-4fbd-9a16-61b635b81d76	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-16 13:46:46.675
ada913ac-f0c9-4206-a275-f1dc58efba9b	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-16 13:46:54.408
5397f308-aaa9-4bca-893d-a71283708a09	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-05-16 13:59:00.579
ae812004-db33-4e9e-b9d7-4b56bb4722c5	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-16 15:40:12.794
e0ed66a8-35aa-4f30-b22e-17e6c1077fc4	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-16 15:40:15.283
594235b3-684b-4208-8f15-e7dfbe6a0cbc	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-16 20:11:32.872
46653f5e-d35d-4127-9f95-aa4bef4a61ea	page_view	/products/8840eb31-4b9c-4870-849f-fac65c4b8797	{"path": "/products/8840eb31-4b9c-4870-849f-fac65c4b8797"}	mobile	Oskaloosa	United States	2026-05-17 03:34:34.624
2e11f615-f0e5-4cec-bc4a-601d72169685	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-17 03:55:43.48
c151a6ee-40c7-4c33-b34c-739d383b5632	page_view	/	{"path": "/"}	mobile	Amsterdam	Netherlands	2026-05-17 04:21:30.441
576b55b8-708d-4e8c-96e7-41a65b561804	page_view	/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D	{"path": "/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D"}	mobile	Mountain View	United States	2026-05-18 04:08:42.165
7774a951-bb96-4db8-8f2b-3a1db847af78	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:11:19.668
144fccd7-e605-478c-8c0f-756a96fef767	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	mobile	New Delhi	India	2026-05-18 05:11:25.632
38558fbd-5c12-40c0-b768-2aaac158f966	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:11:25.701
3d0d0e5a-dd6b-4af5-92ec-9610c35e365a	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:11:29.259
7fa1f3aa-5728-418c-9048-caa9137ab257	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:11:30.953
a8a84f3a-b0b8-44e2-b8fc-f3d55354523b	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:11:31.065
aec25cf7-ab7b-4800-842d-d4dac4e6bb2e	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:11:40.107
23ff0797-da73-4bb9-b5b0-e75e8bc9db3e	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	New Delhi	India	2026-05-18 05:11:42.155
71cd1ceb-ec46-4a57-be67-210e73498b26	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:11:42.233
f7def36a-5c20-4970-b705-0cfa5fa8fe2f	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:11:45.712
eb46405a-b5cf-46b8-9cc2-61ed0c17c228	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:11:47.343
97d7f1c0-1850-45c7-9ca1-cc5b8d63d918	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:11:47.413
f22bc7ba-9757-4029-bcb5-5c7cd5cf2f3c	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:11:53.407
e531af46-599c-4184-a9a7-b63db1384c8f	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	mobile	New Delhi	India	2026-05-18 05:11:57.256
0058a1b1-81e7-4032-8263-b0162d27040d	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:11:57.356
447e81f9-d1a1-45e5-adc4-b9fe7be09ebf	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	New Delhi	India	2026-05-18 05:12:00.44
b8c26f7a-f6c7-44a0-91e6-4f8c15665c37	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	mobile	New Delhi	India	2026-05-18 05:12:00.463
9cdb28d8-dd4a-499a-9adb-55b55842e319	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	New Delhi	India	2026-05-18 05:12:00.537
3781f2c0-ab71-4a25-87d4-d6f07fafa191	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:12:14.861
f007b6f4-89f2-4faf-b8b1-be0577e4424b	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:12:17.472
9d4c8e8b-6a52-4263-8a78-5a03159fae52	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:12:20.292
cf7df2ab-278a-424a-af92-1c73255c83e8	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:12:20.359
cdb16db9-71f2-438e-8551-35dda888226d	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:12:24.685
e20c62ed-7ebe-4dbb-bbef-9b194b45a094	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:12:28.02
68e45fee-3d92-415a-9fa3-8119cddfd91f	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:12:28.132
06ce192e-34cf-485e-8179-53e5dafeba37	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-18 05:12:33.386
df69b165-b27e-4559-a2a3-1f80302d9452	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-05-18 05:12:38.921
99aba568-900c-4277-8a18-08247f3a6627	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:12:50.953
acc8d52b-5aa6-478a-90da-dd829427c767	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-05-18 05:12:51.019
4c71b82d-49b1-4cfa-84b3-106389e1a58e	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:12:51.025
b1e75099-ee07-48d3-9c1e-1b86fd079c40	product_card_click	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:13:52.939
7ebcb893-971b-45af-9678-a1a0ba5d2ba5	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	New Delhi	India	2026-05-18 05:13:52.985
07404261-15bb-43fc-aaff-ec664791095d	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:13:52.997
a3022caf-3662-4837-90d8-0ef433decc31	product_card_click	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:14:07.836
1ab27065-3f45-414b-88b6-3c19083f9adb	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	mobile	New Delhi	India	2026-05-18 05:14:07.932
4fb9abd9-17ee-4e69-ae25-4c7c02244117	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:14:07.992
bda22238-e25a-4263-92cc-20fb52bb5252	product_card_click	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:14:50.85
2a97fc3a-ccd5-4478-b793-70c29ff67400	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-05-18 05:14:50.885
aa2c01f6-9469-432a-adcb-deee0139dc2a	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:14:51.082
015ce076-b275-4861-8694-0b9ece395354	product_card_click	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:14:58.315
c4b1afa6-ff7d-48ee-81fe-5fa46285981e	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:14:58.411
615ce606-74c0-4724-bcb2-91e8be83c6d6	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	New Delhi	India	2026-05-18 05:14:58.413
8c32dd5d-e0dd-4425-81fc-2dd2a2b8224a	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	New Delhi	India	2026-05-18 05:15:08.721
87eb98ae-02cf-4c4f-80a0-99e919508769	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:15:08.846
ac2af731-8410-464a-a76f-b758b22675e6	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-05-18 05:15:49.621
1105d511-79bb-4339-afbc-444b3d2e3063	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-05-18 05:15:49.63
75006a75-5f61-4ba2-918b-4af7a060c6a9	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	mobile	New Delhi	India	2026-05-18 05:15:51.266
59c702fb-d167-4127-9151-56735cc4736e	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:15:51.367
41889b06-763d-4288-92bb-bd6d9ee6b859	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	New Delhi	India	2026-05-18 05:17:25.472
a3c01833-954d-4f7a-909a-e3689816396a	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-05-18 05:17:25.483
888f847a-9066-4623-a42f-431633a1d641	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	Delhi	India	2026-05-18 08:56:41.876
29afb072-190f-4daf-aaf9-7ee38fc21c9a	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	Delhi	India	2026-05-18 08:56:41.914
e5a21447-6ecd-4512-b901-75b742578b07	page_view	/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D	{"path": "/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D"}	mobile	Mountain View	United States	2026-05-18 16:44:12.85
56fe3a20-5cf8-45fe-97cc-aec0535ab8bb	page_view	/	{"path": "/"}	desktop	Prineville	United States	2026-05-18 16:50:45.291
89d6dde2-8e50-49b7-abfb-aebf5da30468	page_view	/	{"path": "/"}	mobile	Prineville	United States	2026-05-18 16:50:45.356
17948745-3232-4f16-89ea-d5d368ffb576	page_view	/	{"path": "/"}	mobile	Forest City	United States	2026-05-18 16:50:47
89c81e53-5c3d-43bd-9299-cc4e2b6e21de	page_view	/	{"path": "/"}	desktop	Fort Worth	United States	2026-05-18 16:50:47.472
a85a5fcc-940d-4e56-8bf2-74ea1813a6ed	whatsapp_click	/	{"source": "cta_banner"}	desktop	Fort Worth	United States	2026-05-18 16:51:00.015
60ecd833-fccb-4c79-a0b0-ff17b15dbc60	product_card_click	/	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Fort Worth	United States	2026-05-18 16:51:00.016
9405f5c9-1fa1-45cf-9ea2-9360475e75d4	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-18 19:27:48.106
7a8fc53e-0671-41e8-9c1b-757298c7a0ba	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-18 19:27:51.89
54287db8-70aa-441e-8530-4c3e29f7baa7	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-18 19:27:57.917
313908ed-b6e5-4aff-9417-583bc13f2205	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-05-19 02:44:35.697
ca4d6891-2655-4304-8aaa-560da82c4684	page_view	/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D	{"path": "/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D"}	mobile	Mountain View	United States	2026-05-19 04:37:51.677
7f433618-d671-487b-9f48-93a702876018	page_view	/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D	{"path": "/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D"}	mobile	Mountain View	United States	2026-05-19 16:37:11.174
0b5793ec-fe6d-4fa9-a9bd-d1b115e0fa5f	page_view	/	{"path": "/"}	desktop	Quincy	United States	2026-05-19 16:44:54.613
1685b2f5-155a-4bae-8a0a-6fef06d3b306	page_view	/	{"path": "/"}	mobile	Clonee	Ireland	2026-05-19 18:01:44.103
fb639a3b-92ee-42c4-a662-1c0f9d186811	page_view	/	{"path": "/"}	desktop	Prineville	United States	2026-05-19 18:01:44.605
a967c6eb-415b-4ba5-ac48-d15ff2c3030c	page_view	/	{"path": "/"}	desktop	Luleå	Sweden	2026-05-19 18:01:44.707
cba3cf66-74be-4fb8-a325-2c9c2509d537	page_view	/	{"path": "/"}	mobile	Luleå	Sweden	2026-05-19 18:01:45.192
bdfcb47c-f7d0-445e-88a2-2e42cd468c19	whatsapp_click	/products	{"source": "cta_banner"}	desktop	Prineville	United States	2026-05-19 18:01:58.041
5da6e20f-bac3-4914-b3f9-d6a0baa9df5c	page_view	/products	{"path": "/products"}	desktop	Prineville	United States	2026-05-19 18:01:58.048
97174724-f196-4eee-8d17-7d1acd8a3341	page_view	/	{"path": "/"}	mobile	Clonee	Ireland	2026-05-19 18:02:20.975
b751cfdb-99be-4092-a0d7-841b0aa805d1	page_view	/	{"path": "/"}	mobile	Altoona	United States	2026-05-19 18:02:21.313
53862037-955b-4848-9785-ed6bcc3205cb	page_view	/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D	{"path": "/%22,%228%22:%22d9ae4f66-9d34-4d18-bc4f-89158b81ee16%22%7D"}	mobile	Mountain View	United States	2026-05-20 04:36:00.742
cb07fe44-aacc-44f3-8f0f-659e18bdc20a	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-20 07:10:55.258
dfbd81f6-79b6-485b-967a-4aa4ef5ac791	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-20 10:43:20.029
dfdf2433-ac85-4acc-acfa-713f09c10f6f	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-20 12:00:58.953
99a734ee-5628-4dbe-a7b1-44421da61225	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	Delhi	India	2026-05-20 12:54:58.132
6c87768d-582b-4344-bdcb-5e4f6be3b327	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	Delhi	India	2026-05-20 12:54:58.302
a7ebc449-3a93-491c-8852-58e42f2056c8	page_view	/	{"path": "/"}	desktop	Luleå	Sweden	2026-05-20 14:27:23.355
82e0dbca-2153-4912-a3d8-bf874fee1767	page_view	/	{"path": "/"}	mobile	Prineville	United States	2026-05-20 14:27:23.566
a57ad206-4d5b-4d38-80a6-00913377ed54	page_view	/	{"path": "/"}	desktop	Prineville	United States	2026-05-20 14:27:23.667
659d592b-7984-4150-8866-db56ba87be47	page_view	/	{"path": "/"}	mobile	Prineville	United States	2026-05-20 14:27:26.102
1f9180eb-802d-4991-91df-b6af10b9700b	whatsapp_click	/	{"source": "cta_banner"}	desktop	Luleå	Sweden	2026-05-20 14:27:35.623
88ecd50d-dda5-405a-bafc-daf94ffad4b2	page_view	/	{"path": "/"}	mobile	Forest City	United States	2026-05-20 14:27:46.348
49ab31c3-068f-4582-a08d-6cb05a027b22	page_view	/	{"path": "/"}	mobile	Springfield	United States	2026-05-20 14:27:47.541
208694ef-99d6-45fd-8b5e-479ca2192bd1	page_view	/	{"path": "/"}	mobile	Clonee	Ireland	2026-05-20 14:27:51.152
a250208a-d093-45cc-a643-90ee920af0ec	page_view	/	{"path": "/"}	mobile	Altoona	United States	2026-05-20 14:29:27.568
f0698ea3-1332-4734-b457-a0d4abce6b15	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-20 17:26:51.514
1fb030c7-838d-4e25-bc44-f63bb013d1ca	page_view	/	{"path": "/"}	mobile	Morādābād	India	2026-05-20 17:33:39.072
2d6cb375-ae3b-48a3-a711-02415cfe4176	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-20 17:37:26.162
1809386b-6c27-4e0c-9fae-51617f97d28a	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-20 17:39:15.5
348d7c57-0619-4fa5-ad93-b63b8c5d896a	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-20 17:39:15.501
6c59af55-726d-469a-a8d7-27aaa8167b58	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-20 17:48:27.428
971c508f-b187-48da-a6f1-8a5312bea01f	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-20 17:48:33.786
1843e634-c88f-4b0e-99f9-5e31e3d67a06	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-20 17:48:45.173
93f2bb16-ef7e-460f-a4fb-b19f72b0d337	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-20 17:48:59.063
aa679ca3-68c3-4c12-8c4f-69ca95555c13	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-05-20 17:53:27.276
9b0ddcb7-df1b-49ef-8184-9486d96f3e9e	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-20 18:20:46.028
f5faa9da-c975-4ef2-bb38-5c3a7dd30214	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-05-21 02:55:16.883
1cd9da06-0e72-4b96-a653-e424fbc14d16	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-21 05:49:44.844
4d632c9f-a094-4865-bf91-f2962b48880c	page_view	/	{"path": "/"}	desktop	Hardoī	India	2026-05-21 10:10:57.545
fc05a1cd-b4bc-4408-a269-ac05c1ce8988	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Hardoī	India	2026-05-21 10:11:07.084
8bc924ef-0872-4b9a-b941-92d7514a4bcd	page_view	/products	{"path": "/products"}	desktop	Hardoī	India	2026-05-21 10:11:07.109
4faaa2e6-a9c6-4b6d-b0bc-b12d02f12033	page_view	/	{"path": "/"}	desktop	Hardoī	India	2026-05-21 10:11:11.824
8199fcfa-7ddb-4b64-b346-b868945927bb	page_view	/	{"path": "/"}	desktop	Dallas	United States	2026-05-22 04:18:11.649
b5138fd4-4eba-43a7-a17d-4d057c2b3bee	page_view	/	{"path": "/"}	desktop	Dallas	United States	2026-05-22 19:24:21.33
f861b4f6-c107-47a1-b1a0-78ec6f693c07	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-23 18:02:19.831
b6a4592f-4d06-4530-bb58-a240c9b9fe74	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-24 18:49:45.018
a9a99817-61fd-4df0-a9fc-84dad22e8697	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-25 02:12:51.504
218c8aa1-2404-4fb7-897b-0a57aa263ef8	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:39.641
a0c55694-9708-40e5-bb04-57817064b334	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:39.684
b9757ee1-7993-466f-a08c-8f8c11f32e92	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-25 09:08:41.707
ca4b38eb-73fc-4a4b-9c47-83ed91899f84	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-25 09:08:43.236
2dcb3c79-3b1d-467b-b703-c8d0f2353865	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-25 09:08:43.253
20758fa0-0a45-4aa0-960a-6b1b9f9d51ee	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-25 15:44:10.663
7f08a5da-a5d6-4c0c-8348-de82c0cd60af	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 00:29:41.733
36fba12c-e337-42fe-854c-9ac0cd42b59e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 04:32:31.987
dc47a357-970e-47fe-9f23-73993bcb3be3	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 06:11:14.17
c7f6a1cb-3714-4822-8fa4-ac6c21aeaf5c	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Delhi	India	2026-05-26 06:43:08.973
7af1d820-fdbf-4db5-8f7c-e94914e6c343	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 06:43:29.148
54c138f1-cb4f-4c71-af33-174e15424784	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:00:37.717
f74e29b7-b825-4422-9c44-76ef424e194b	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:00:42.012
7349d7ae-0b72-4c3e-9c06-1de8f362f96f	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:00:42.056
799caeed-0b98-47fa-b95a-39c348edeaf1	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-26 09:00:44.041
e867ddc6-22f4-4100-9c6f-25a1cbd1aa13	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:03:10.254
f9838d3b-19d9-44c2-8e92-4beda2d0a7c5	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:03:12.363
11a24342-ca61-48c3-bdd5-866f8db0dfff	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:03:24.727
0c2e8b8c-78e0-4bee-b371-b32b96ea8b27	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:03:24.783
beab7c39-48cb-420d-98f0-6f45247f7120	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:03:35.535
f8d1d960-0f5c-44f3-9e87-d39ac77a179f	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:03:37.06
f1f215a5-0a32-4264-ac4a-5f2ebee7c34e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:03:37.152
f2a8829c-f7c8-4882-a90b-87c96130b1dd	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:03:39.995
1c04c005-c2ba-494d-9ec4-f2e1ec953b72	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-26 09:03:40.011
bd842162-b439-4b26-9559-62d345e2fb68	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:03:40.113
ed54c5fb-d9a2-4c9e-9b7a-03cac51eac25	product_card_click	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:03:46.404
4c9013d8-2b73-4ac9-9971-6de7d14a994a	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Delhi	India	2026-05-26 09:03:46.428
ea64dfbf-2fc2-4c9b-879c-cbec7aed75aa	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:03:46.434
9ca936b7-4456-4d0d-ac6f-48814afade0d	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-26 09:03:49.227
18524336-62c8-48ca-9585-7c608b24256d	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:03:49.247
020d5efd-b1e5-43f4-a251-5ded0d63234a	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:03:50.011
563b738e-21ad-4a39-8828-9e3cb7dcb24c	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Delhi	India	2026-05-26 09:03:52.315
f77fac11-4bb6-4da4-9c05-3a457cc8161f	filter_applied	/products	{"value": "Cotton (100% Cotton),Bio-Wash Cotton", "filterType": "fabric"}	desktop	Delhi	India	2026-05-26 09:03:54.123
100df082-f8ac-46fa-b5b5-860f944fe7cd	filter_applied	/products	{"value": "Bio-Wash Cotton", "filterType": "fabric"}	desktop	Delhi	India	2026-05-26 09:03:55.461
0ebf74d9-c179-41d6-a0a5-368517f40cc7	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:03:58.3
6556919e-0fe1-4cb3-920a-e477e6b12536	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-05-26 09:04:01.207
2f211dcf-cc73-4455-a940-1e204ffbe099	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:01.306
fbf8d438-9e0e-4490-bec5-4de9164ca4a2	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:04:07.685
76f45b54-3681-42cd-9873-85dce7c00ae5	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:08.617
943ba1fa-8a09-4707-acdb-c5b2996c3239	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:08.719
a0f714ca-8427-4bc5-8cf3-282be347c760	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:14.351
9ed164a0-4291-48b1-a038-7f844b60f20f	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	desktop	Delhi	India	2026-05-26 09:04:14.352
36a0fbb2-e2e7-42e7-be07-d8c55675233d	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:14.359
38dd43a8-f26b-4cc7-bc1b-4c41020ce1e2	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:20.252
26aa75e0-49c8-49ff-9b22-850620c86a87	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:21.991
73290832-8ac9-4e8a-92ab-c8728102974a	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Delhi	India	2026-05-26 09:04:22.073
6b530845-6205-44cf-9e8d-aa439426bcb3	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:22.108
c2f4382b-f54e-46ab-bee2-871401c3bfa9	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:26.878
9022734b-723e-42c3-af22-a6d0c53f3ec7	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:04:29.26
27cfaf97-3761-445a-a65e-67a7099980b1	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-05-26 09:04:31.088
8a270d2b-d9a3-4c00-ae68-2566f2bb659d	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:31.205
58a352c3-2156-43e1-b9ce-00e052f03037	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:04:35.747
d02fd2a0-01b4-446b-9ecd-b7d0a563adfd	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:36.573
1dffc02c-fc5f-4714-b40a-d673f95fd655	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:36.675
30d1261e-c91b-41e3-8af7-83c61eaa97bc	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:38.677
e6565cc3-316e-4e42-b256-ad73093e7209	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-26 09:04:38.696
3c83ec5b-3026-43f4-828b-8abeae6a15e7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 10:28:04.052
0fb0adce-12b3-4a12-976f-1abd8708de38	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:38.803
e7516961-ee92-4e40-9f70-acf3cc87402f	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:40.798
4e23d5d7-e768-4619-afaf-ab654a190e86	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:42.438
2e30384f-10ad-4101-a6bc-8c219f4e6375	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Delhi	India	2026-05-26 09:04:42.449
f95b5abb-cb85-400a-8aaa-2d02e2477ca2	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:42.461
3a085f2e-f466-4b18-9f1f-34ce7c960634	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:49.155
fb037916-1877-4e03-b85c-da8170e7b71f	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:50.964
8872621b-28ff-4b2e-aa0e-fa70b0346fc6	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Delhi	India	2026-05-26 09:04:51.049
2ebc3135-06bf-4d91-8291-6447229af491	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:51.052
986fb34c-2716-4278-bab1-768d41e672f5	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:04:55.569
d15712c7-aa56-4aab-940d-f06a0a2ecb4c	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:57.241
ecfa1b0d-4eb6-4d3d-94ef-4957c237e4c7	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Delhi	India	2026-05-26 09:04:57.314
fd5a3991-5f8b-4326-b628-36aa0974a981	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:04:57.346
330202c7-0ca3-42f2-b14c-6b4816cc4e64	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-07-23 06:01:08.26
c2478167-d949-4c36-b4b1-24dcf9d118a1	page_view	/products	{"path": "/products"}	desktop	Gurugram	India	2026-07-23 06:01:08.378
4e4e7239-8b6e-4d4b-8a68-1d47417325e3	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Gurugram	India	2026-07-23 06:01:44.87
26976f2a-45bd-4bdc-af71-631ebfe8bcf9	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Gurugram	India	2026-07-23 06:01:44.904
582c30cf-e232-49d7-835a-9f849a71464d	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Gurugram	India	2026-07-23 06:01:44.915
21af2986-15d1-407d-a887-e21f356dacf9	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-07-23 06:03:04.324
3ed91390-d72f-4df8-beb2-bd0f25c73c94	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-07-23 06:45:41.921
b1cde443-29f2-47e2-b081-9f66f79bd870	page_view	/	{"path": "/"}	mobile	Indore	India	2026-07-24 16:39:00.599
724511d4-84d6-4cf7-b2cb-d9f241f92a52	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Mountain View	United States	2026-07-25 08:58:57.368
3c31877c-6773-4bc2-8db5-62b0a83c03ce	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-25 08:58:58.54
b02bfdd7-828a-4ba8-8796-86f95c03d044	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-07-25 15:14:09.751
d8e070a5-4f6d-47d3-8521-4e7b3a2faee2	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-25 15:14:09.937
679de2bd-8d78-4253-9d92-9beff9f1a818	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:14:16.588
0565e8d5-d467-4ada-9ef3-94403a48cceb	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:14:26.626
54078586-d9e5-40e2-8373-967300d24b89	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-07-25 15:14:26.877
05182e6b-7eee-4af0-a39d-1d635bd56d74	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:14:28.76
48114911-d4d8-48de-8bb2-5314499fd117	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:14:31.633
a04ba330-6c9d-4b3f-b2fc-f71d575b1b37	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:15:18.632
ab6a8f37-e88c-490d-b405-ebff4541e588	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:15:43.788
314296a6-c5b3-41ed-986c-c2c40b6d64fa	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:15:45.87
86a2b877-7329-485a-828f-758af2a5e762	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:15:48.205
18908180-1b6e-425d-94e3-fa9af8a25c15	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:16:10.762
1f420303-f8d1-4da0-9338-54b452bafc12	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:16:12.498
4196caac-97da-43f4-bd2c-1e4ab1088732	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:16:16.659
e9d3d659-ba70-4b0d-a003-cdedea92ae63	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:16:18.638
43721149-41cf-44d8-b1cf-cf60b475cda4	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-25 15:16:51.36
f5d23dab-d4b0-45e1-8f11-b2c629c37bfc	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:16:51.368
b1385240-b8b6-4fbe-b79f-19b1c37da9f6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:16:52.948
7e72b85d-30a6-4f3b-9932-aae984e68441	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:17:10.503
27f5e796-eee0-4245-88b3-142d73f3c4b4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:17:11.056
8a148eca-0cc1-493c-9c2c-7db1722496bd	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:21:15.139
ec45c19b-da87-417d-a0fd-75f3125cb903	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-26 09:06:05.34
fa3940cf-06b3-460c-a2ba-3c5a1ede9246	product_card_click	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:06:05.336
a2ec1c64-adb8-4172-99c9-340fff5c8900	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:06:05.377
c874eb9c-2b9f-479b-ae14-76f403794cdc	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Delhi	India	2026-05-26 09:06:10.217
d93d78d3-d177-477e-82c7-5eb8e2634f26	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:06:10.262
d1d87980-0628-450b-8fd2-25c04902377b	product_card_click	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:06:16.339
76eb2959-0c77-4d48-81fd-fc8517717598	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Delhi	India	2026-05-26 09:06:16.353
111ba99f-a23e-43e7-8e6f-214d269b350c	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Delhi	India	2026-05-26 09:06:16.359
81f37945-0d6d-4e74-8990-8ebf517652ba	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Delhi	India	2026-05-26 09:06:23.197
f95991ee-8f61-4bd8-bb46-32611b94e413	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-26 09:06:23.199
6d150349-8f53-4a83-a404-9738597d283f	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 09:06:30.907
8c50ed56-2482-435d-bd5c-c57ab2c72d95	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:06:31.672
fb93c628-0fea-4893-8703-c6310934ac60	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:06:41.427
a29c024b-0e55-4cec-bfd2-d069b1a6894d	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	Delhi	India	2026-05-26 09:06:41.445
eeb1ac8f-a880-4734-b945-e319470d0f21	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:06:41.453
b97b349d-9616-461b-9a17-2487e834377e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:06:56.294
ccdf90b8-71a7-4d9a-8020-a9d36fdb261c	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:06:57.866
dbf182b8-7d85-4e86-83ed-f5fba0f4eb4b	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	Delhi	India	2026-05-26 09:06:57.95
6db05987-f669-4617-8b38-3a6b5d3e1cc0	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:06:57.952
a6cef547-ad47-491c-b62b-15d045184711	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-26 09:07:04.583
da649cdc-a443-4b46-8a8f-48e5485040da	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:07:04.585
d76edefd-4f6f-4bae-afa7-95e12728bb3e	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:07:04.589
a7609817-0e80-4b99-97a6-40af175bc2dd	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:07:14.305
e309b166-4de3-4416-ab36-ba8374ded234	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:07:17.421
ae70126f-239c-498a-a452-de985e419752	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:07:22.2
78d67960-3544-4cd5-929e-bb31b5662d81	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-26 09:07:22.208
aef3296a-d9d4-420d-a960-04fbeba4a640	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:07:22.284
e91457af-e90b-497a-8680-daf07cf81830	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:07:45.873
14b90cd6-4ca3-43f0-8c3c-b976b3a1c4a7	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-26 09:07:45.888
a0844012-1c01-4dbd-b3a2-ce5de3a71e8d	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:07:45.89
67b70d1e-8c85-47dd-9b0e-970281e840dc	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:08:10.329
7460d136-b9b9-4627-a8e0-75ba5ea453c4	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-26 09:08:14.89
d336f98c-726e-4872-8bbf-9131c8ac9e95	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:08:16.272
b416dbd8-24e5-49db-a009-db5f4f5e0063	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-26 09:08:16.351
bb591824-6840-468f-9b74-bd3511490926	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-26 09:08:16.361
636ea4fe-f674-4e96-ba38-2ce634e3a9f5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 10:44:18.315
7251688e-be97-43ff-b975-3fb0b27dfd1f	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 12:50:46.22
4c646350-1d78-43f9-b4c6-6adb66fb9e7b	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-26 12:50:47.645
e7e07965-3448-4746-bab4-4d0a509e1050	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 13:20:11.189
748db4e8-20ef-48c6-a1a9-55357adaeaba	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 14:40:50.661
75fbfd17-ef7a-4039-a902-489432c13eea	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 15:41:02.161
8904c2b6-4ea5-47d4-a541-2a8f2765d895	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 15:56:35.37
b59ce5a0-295e-4c09-b148-89eb9048dd0f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 16:32:32.627
336a8879-1f80-41ba-a5dc-e1b24c6b04b9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 17:07:29.569
059471fd-c519-40f2-9c0c-d6925176fc91	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 17:39:06.188
3c223671-1985-4cc5-bf0d-ed5b0ea36ec6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 18:14:50.807
97419800-d8ee-40b0-bc02-d8fce73339e5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 19:36:17.493
4de2cdcb-a00e-4d59-87fe-760bd05fbeff	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 20:14:06.892
b8c8cecc-997d-470f-b67f-ff6135b6f27b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 21:03:37.477
ee190d50-bdf6-4635-87c0-92c1c1336abd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 21:10:08.096
ca847c64-bbdd-4dc6-a6ae-e9ad5e9d4f24	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 21:38:23.946
d06ca392-0945-4c34-980d-04a759efeb15	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 22:35:33.041
a53ebe69-a02c-48d9-a720-61da38d6c59d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-26 23:09:32.67
c6f8bef8-abcb-48f0-bcd9-6174cc82cde7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 01:01:35.257
b769c420-0f23-46d4-a29e-7e28494bf13c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 02:04:45.816
436f92db-2a08-4e74-b46c-221d63623073	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 02:50:00.85
87a359de-25d1-4143-a9b9-cd74dd209fef	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 04:55:24.822
5e461844-9f3e-4e0f-a970-a38946320171	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 08:01:16.795
b7c87897-cef3-4cd5-b177-81000579912b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 11:26:01.648
feb61d30-ad3f-4e12-9d73-7b899dd93cce	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 11:41:08.304
23b08e5e-3c92-401c-a18b-b66ef8fe7c96	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 12:04:28.64
bd9ae0f5-1fd9-45e2-8596-50e45b1892e3	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 13:41:28.357
82022ba5-2e2e-4b3c-850d-16c2ccdd2d22	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 14:50:28.624
cff8ce2d-81b3-4270-9660-b377e5879990	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 15:49:24.12
e9135fb0-6a25-4012-a8f5-0c8ba3e71394	page_view	/	{"path": "/"}	desktop	Quincy	United States	2026-05-27 16:45:30.438
0d25a67f-59a6-4364-8d07-368108407aa6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 16:58:40.863
3dc94e46-4b21-4b54-b387-1d064973be59	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 17:04:42.797
806b4657-fd81-453a-8a68-6626512d7edd	page_view	/	{"path": "/"}	desktop	Seattle	United States	2026-05-27 21:12:55.848
cd9aa613-f537-435e-8ed5-bc7eca0b5848	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-27 23:52:33.328
314c594e-7588-4118-b2e4-e6ead84ce745	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 00:37:13.027
57943570-3103-4556-9501-f0dc7f935966	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 07:19:53.925
2a132fb1-5d85-41c7-b0dc-4f8ae1101374	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 09:58:43.439
1b71c98b-9cd4-41b3-baef-f521a5c22e1f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 10:12:51.202
5ff1b893-da93-4eb4-84c0-f3a64cd0d3b3	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 11:48:05.172
a785baac-863f-47eb-9ef1-c5173a14d0bf	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 12:09:30.873
4521d01b-7163-4d75-8cfb-5990b81a8558	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 12:35:30.599
ef6bac86-3561-411a-b6a8-022cd4825ef0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 13:46:12.455
17962cc1-271e-422a-a113-677abb59e0d0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 13:53:54.115
81eb2833-155f-4fe8-8d39-eb7e72349f15	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 13:58:45.434
ccee5fe4-9d2f-48a5-9caa-72de0d73e96f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 17:00:50.253
102cd107-9722-4b4e-9437-272cf3db7942	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 17:22:10.927
fdc6df0b-a2e8-423a-9aac-559c820950ec	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 19:22:06.989
4aee7fbc-df71-4ca0-b176-f5940e34e80a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-28 20:02:39.455
542f7a51-ee54-4862-9bf1-e8425e1a8ec6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 06:08:01.58
3c1f82d4-ef3c-4cdb-b78d-b28343e8876e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 06:53:15.091
e7ae1b75-cc2e-4b69-b4a2-abbf1a91ea82	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 07:27:44.835
93484cd1-a855-4b74-b9e5-9056baccae0c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 07:56:32.454
5e15d141-f6e4-497b-971f-3f0e65436f4b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 07:59:11.485
cd588f8d-c288-48b9-8572-03bd918acee4	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 10:25:55.307
8ae5d58d-94c1-4207-aa4c-fd10fc03b4af	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-29 10:51:03.618
85e172cc-1217-45ac-97d1-a3a6ed9ef6ff	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-29 10:54:11.067
7b653e21-c62d-429b-b6b3-fd59855c3414	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 11:33:44.744
3f5afe87-640f-497f-bad8-168eac0f092e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 11:46:30.346
ade570ba-c2ef-4be6-a463-b85b0bcae50c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 11:58:09.816
a4e851f3-919c-48d4-a84e-eba95c4baa01	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 13:09:37.055
da8472e4-6ccd-4caf-a392-fc6d26c48af6	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-29 13:24:12.355
3a4302fa-ed70-4305-95ff-996bcc4bb8cd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 16:41:59.936
35e7a786-3d14-4dc8-8479-909723f30d5f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 17:23:21.212
8a5ffd29-50ae-40d2-8909-2dea6f6efaae	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 19:52:03.965
125ea9bf-66ea-430b-bd71-ba34a2b66300	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 19:57:34.675
020cde63-066d-43d8-97aa-db7ba6294cce	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 21:21:57.283
f250076b-a4c5-4eb2-a9a2-11f1846b97c9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-29 23:20:46.964
065f276c-be9c-49cb-a850-6046401dadc9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 00:41:13.092
d43c340f-f1bb-4247-aa7a-be3069683558	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 00:46:13.068
e313da0e-e134-41d4-baed-5c5ccc5c982f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 02:19:27.265
be9a9927-f8ca-48bb-8435-c74a9536fcd9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 02:48:14.745
b1b8f3fd-9b0f-455e-b3e9-2dc1c45ffd0c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 03:44:33.32
7c7ec312-f3c0-43fc-ab08-98bc59b4602b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 05:33:14.248
f180ef55-38bc-4e2c-b390-16e7883a98eb	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 07:19:13.734
cf790a96-6647-4505-86c9-0a903edb71b6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 07:19:32.054
1ecea0e9-f6a1-49b5-8092-5b6de759d581	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 07:21:15.407
b4a45244-ce4d-4186-ac08-5df876c29089	page_view	/	{"path": "/"}	tablet	Mountain View	United States	2026-05-30 07:31:40.4
a814f680-e435-4522-8e31-cca5858933a0	page_view	/	{"path": "/"}	tablet	Mountain View	United States	2026-05-30 07:31:41.153
88655c70-eb87-4ad1-a207-ad4f409c6d1c	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-05-30 07:32:33.497
b48fdf29-f6f5-40af-8973-f23cfe2554cd	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-30 07:50:57.873
d1d9e1b2-a9c3-49eb-a8be-cdeca2e32870	product_card_click	/	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 07:51:05.466
3a1e0d52-b4ad-4132-ba34-cbd59e6667ee	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Delhi	India	2026-05-30 07:51:05.492
527df955-6755-44fc-a6d9-4981bd4eacb9	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 07:51:05.496
d44417c8-152e-44f8-bc76-12cc3b486b47	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-05-30 07:51:05.909
5ed2404c-3ee6-42a6-afac-8f020b7d30a4	page_view	/	{"path": "/"}	mobile	Noida	India	2026-05-30 09:01:27.875
b53c8b66-eaaa-4f4a-884e-cfe91bdf510b	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-30 09:24:19.399
bd0d3b61-d277-4974-86e3-c56f81fbd961	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 09:24:24.336
ea41c9c1-1f0a-44e4-bba8-7e4e461f78b0	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-30 09:24:29.241
c9ebc168-6f6e-4c0c-86a9-25fee2b452c4	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-05-30 09:24:29.261
0710d8e5-6742-4602-a590-7e160054fbd7	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-30 09:24:29.271
943f4d40-447c-4a69-a672-95455956f236	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 09:26:22.311
98920fd8-69a7-4b79-8868-934a0fecf5a9	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 09:26:39.363
4e198dd1-f5cc-418b-8a74-25f3b586c47a	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Delhi	India	2026-05-30 09:26:39.37
5217d583-0bbf-41df-9d2d-0d668f645a74	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 09:26:39.385
af0ed512-0f77-4a2b-8de9-48db46f7749c	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 09:27:06.899
99acfac5-82f5-40aa-82f9-a47444d256ab	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Delhi	India	2026-05-30 09:27:16.383
70524b13-3fb6-41b8-9c66-dd86b2973188	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-05-30 09:27:16.386
7ab4fc47-4b67-4c67-bf59-f5b215804249	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-05-30 09:27:16.392
d8ce9536-9127-4714-ac3a-7890127318fb	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 09:27:38.557
16ab574c-10af-4ca9-9b81-05da824f142a	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-30 09:27:43.064
f460c816-499d-41ce-82d9-57c627b9cbad	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	Delhi	India	2026-05-30 09:27:43.084
24d03a09-0e30-4b88-a6a5-59f3ec6e7262	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-30 09:27:43.124
a7717616-a1ff-4aee-b0fc-947878e502f6	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 09:28:08.991
3018ee21-0f3b-4f8b-9489-1cc53af93b89	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 02:33:01.507
d865238b-cdc5-4f25-bc85-c3c21284daf3	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-05-30 09:28:14.141
d7368fb1-8757-41cd-96ca-342f4d6a3279	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 09:28:21.918
de8a8e3e-4e02-4a03-9cf7-9a15292b332f	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Delhi	India	2026-05-30 09:28:21.943
d514f1d3-6ad8-4e43-9347-4df1786b1034	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 09:28:21.952
f367f0a0-1179-43e6-a247-852b15b09a01	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 09:28:41.105
bb79dbff-5006-4a5f-b471-0a839fdd0791	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 09:28:47.198
cc0b127f-7744-48b6-ae59-32c3ecedd074	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-30 09:28:47.218
1429683b-dd3b-464f-90a1-66576e2b4539	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	Delhi	India	2026-05-30 09:28:47.219
8fe6b414-f6af-4f13-bece-89a49f5b5ba9	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Kabul	Afghanistan	2026-05-30 09:54:13.623
744edb3c-c2ce-41a4-a60d-6f13940d599a	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Kabul	Afghanistan	2026-05-30 09:54:13.743
4c36ca30-87a7-478f-b26f-a3c0830c4501	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	Kabul	Afghanistan	2026-05-30 09:54:14.938
d223dd16-6f9f-4089-934c-b8d9bc0f2abe	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Kabul	Afghanistan	2026-05-30 09:54:15.013
e5a27492-a316-4c5f-9980-e4a86f88a6ae	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Bur Dubai	United Arab Emirates	2026-05-30 09:54:15.589
59b600fe-c3f7-46e0-81f4-2e7573791ad1	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Bur Dubai	United Arab Emirates	2026-05-30 09:54:15.664
45db914e-a7b9-42ea-b4da-a2af59a027ce	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 11:22:03.899
48d0dcce-ba53-4eb6-80bf-fa0dc686e9ee	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-30 11:58:27.152
e6767170-cc42-4c63-b7c1-287ec9f6f770	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 13:01:32.792
d7a8e297-b7e5-42e8-9b85-d2de7dd8ba61	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-30 16:43:49.456
472584a5-d31a-4f5c-9065-c9c6fbc16714	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 17:55:57.497
794e191b-7089-48de-970e-2b2af3aa0737	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-05-30 18:43:34.354
47befeb0-34c9-4416-9410-ccaf3f06e53e	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-05-30 19:10:15.597
37e2ed26-aefc-42f8-9b03-4a94038996d6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 22:10:48.548
a3bd7fc2-9d67-4410-b840-1755d2cef18d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-30 22:49:25.672
f3560cfa-61db-4475-b3ac-a21d7da888b6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 00:27:28.109
a4473c8a-887b-416e-a9b7-54295228ef45	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 04:35:16.193
7ff72eae-4ba1-4514-a7aa-89f5acf4abbd	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-05-31 06:34:13.611
06c840e7-35c1-4d00-a6fb-1df4448ba2a5	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-31 06:34:15.162
4d99ac3d-9f84-443b-92fa-149aaf7ba72b	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-31 06:34:22.625
07b9fffd-844c-4f4c-89d8-01e88211a094	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-05-31 06:34:22.638
837df87f-d46e-4de8-b166-c59648826cb6	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-05-31 06:34:22.639
37a2e6a1-3f6d-4dcb-a405-057fa923abaa	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-31 06:37:54.742
3b46b1e2-daa3-4005-83f7-ebf76d8467d8	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-31 06:38:04.473
830b7e96-0e45-4006-8778-2646a0752d34	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Delhi	India	2026-05-31 06:38:04.492
465dac49-7e2b-4805-a4f4-2c54b9dd15cf	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-31 06:38:04.504
69758f56-2085-418b-805d-55755178b7ac	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-31 06:51:17.602
16cffae4-8b1f-4704-b4ed-bc7aba9415db	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-31 06:51:18.852
014a3156-28d5-4e9e-8b30-9734d1072462	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-31 06:51:18.921
564af28d-f9fe-469d-88e9-dd1829b552ea	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Delhi	India	2026-05-31 06:51:18.943
ba374089-8d5e-426f-8891-57f6f9f79a84	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-31 06:52:58.977
70211887-0b4c-4e50-8bc9-2cbe235ff4fa	page_view	/	{"path": "/"}	mobile	Eagle Mountain	United States	2026-06-04 07:44:14.448
13527bbe-8eb4-4f0f-91b6-3be3525b6a98	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-31 06:53:07.481
16b87dce-5a3d-4cb2-ae6b-1276f4350c70	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Delhi	India	2026-05-31 06:53:07.49
20d006ef-ceaf-42b8-a565-6d24c2fe8bf8	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-05-31 06:53:07.505
06177860-0ab4-4f13-8a14-6726ba3740ed	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-05-31 07:16:29.878
e08057c9-94d4-47af-a704-756eb1f86f96	page_view	/	{"path": "/"}	mobile	Jhūsi	India	2026-05-31 07:20:51.421
8116e8a4-4f65-41c9-881a-1e067f7d6eef	product_card_click	/	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Jhūsi	India	2026-05-31 07:20:56.108
a87ce220-7029-4217-9cd4-1a73fcb33d5b	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	Jhūsi	India	2026-05-31 07:20:56.117
5933b66a-2d13-4010-91f6-57e2021f1cc8	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Jhūsi	India	2026-05-31 07:20:56.232
8e2a60b7-a71b-4b94-b77d-2c8e892ea3ba	page_view	/	{"path": "/"}	mobile	Jhūsi	India	2026-05-31 07:21:05.646
2e246fa9-df9f-47fa-a2c8-d0c7ab9a95b8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 07:39:16.578
a53f3f05-149a-4eb0-9d0d-03e386123bcc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 10:56:46.546
d79e915f-f373-4ea0-892f-9bab54a8cd21	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 11:53:24.143
b4da8d70-98c3-4f3c-aba3-173a5a619dfc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 12:05:49.377
d2b4d550-af7a-41f3-bd83-0d12b064a5f8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 12:34:02.413
b9dc8a71-c5f8-4352-884d-2822ad68a5cd	page_view	/	{"path": "/"}	mobile	Chennai	India	2026-05-31 13:12:34.413
9de5d487-9f1c-4681-98b8-16c946b982d6	page_view	/products	{"path": "/products"}	mobile	Chennai	India	2026-05-31 13:12:40.524
ffd82da1-2e16-4b26-84da-8fd4a9a5d129	page_view	/	{"path": "/"}	mobile	Chennai	India	2026-05-31 13:12:54.655
506804aa-3608-4d4a-8f4f-c6a575553214	page_view	/	{"path": "/"}	mobile	Raipur	India	2026-05-31 15:01:16.38
302b7d57-5f25-4b7b-ae45-c77357a22494	page_view	/products	{"path": "/products"}	mobile	Raipur	India	2026-05-31 15:01:28.03
e1058175-f8a8-42a1-99ea-2ed874ca46fb	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	mobile	Raipur	India	2026-05-31 15:04:24.41
3f6fa402-35ef-4f70-8e37-b7f4c3678df8	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	mobile	Raipur	India	2026-05-31 15:04:24.413
821568db-95b2-4ccc-969a-aa94fe921db6	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	mobile	Raipur	India	2026-05-31 15:04:24.511
cb902ad3-4926-4965-ba99-442ac9181397	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 15:16:13.182
7ae1d539-ab5e-473d-9c8b-1639efa1eb75	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-05-31 15:59:57.301
d8c71a07-f360-4c2c-a995-16abfa7b87be	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 16:37:17.635
d8461fb9-f549-4a43-a194-27add912ed4c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 17:17:59.41
b98caeae-f342-4048-b723-8af9be963b08	page_view	/	{"path": "/"}	mobile	Navi Mumbai	India	2026-05-31 19:11:33.099
96d4783d-7955-49af-a064-d92f821c51e1	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:11:42.885
cd466e24-36e4-4334-a103-d347d9334c55	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:11:42.93
629db9b4-dec0-4b2e-ab7b-c4493e01c6fc	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Navi Mumbai	India	2026-05-31 19:12:01.287
02a98fac-73ab-44ed-9718-c6f7f626241f	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:12:01.298
586b2800-d275-4aad-8ea0-fad444988650	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:12:01.309
e2eba1a9-3cc1-43cb-b95a-bb7c13e6c09b	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:13:47.556
b8f1af90-aa0f-43ae-bca0-381d3932c722	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:13:48.827
a7b05d1b-75a1-4a0f-830d-289e47086fb6	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	Navi Mumbai	India	2026-05-31 19:13:48.921
f8cd0cf6-d995-4cf6-beb1-d598fec33fad	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:13:48.947
f5ed7d72-5a4b-4669-b927-12bfe6c920d5	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:14:05.846
a8cae93d-1d99-439d-a8a8-18c21ecdc365	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:14:09.749
d0668cb4-2007-49a5-8ab1-6af5052a4372	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	mobile	Navi Mumbai	India	2026-05-31 19:14:09.82
413db2ea-4a86-4717-ba82-365cebeb21db	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:14:09.874
2e088259-5e5b-40be-879a-183ac361d770	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:14:21.427
cf1ce480-766b-476d-8f9c-4c78860ff23c	page_view	/	{"path": "/"}	mobile	Navi Mumbai	India	2026-05-31 19:14:22.412
edf2ab53-2f24-4fdb-b318-4a124b5d282b	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:14:24.019
724943e8-69cd-4acb-9136-45dbec753b1b	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:14:24.112
69925f7a-19ee-4cc2-bde3-73d49293cce5	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:14:32.167
012b6c4e-af89-42e3-b2fc-264bd3a6d44a	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Navi Mumbai	India	2026-05-31 19:14:32.171
a96ab8c6-3c95-450f-882e-12b1ea1be98d	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:14:32.176
3c8bb58c-721a-4bd5-8d9b-fd3ba79067f6	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:14:43.724
4fa46492-44d3-4a71-ba6b-2c02036e5491	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:15:02.211
282beec5-6aee-44f8-b59e-f74c75349fd2	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	mobile	Navi Mumbai	India	2026-05-31 19:15:02.219
f62481b4-e1c4-49ec-ad6c-1212fcbabb5b	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:15:02.237
19284618-51b9-431b-b8ce-9f5a30bd2fd1	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:15:22.989
7dd75fda-ee24-42b3-8f43-c28793dadaf4	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:15:38.012
70e77227-8e4f-42a2-9deb-64e1c2b98615	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	mobile	Navi Mumbai	India	2026-05-31 19:15:38.027
4d04f1f7-ccd4-4b32-b953-104fc5da1eaf	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:15:38.027
c4c26cdb-a276-4c9a-9da9-9859505c30d0	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:15:48.651
e65610eb-bbfb-492d-8587-bf3c5ecaeef5	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Navi Mumbai	India	2026-05-31 19:16:08.788
89f43743-5579-4572-a7fc-a907b80b41e7	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:16:08.788
95c62ff9-d5e1-4b67-8917-714eef41adea	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Navi Mumbai	India	2026-05-31 19:16:08.793
c83a240e-007c-4e79-a234-23405b34cad8	page_view	/products	{"path": "/products"}	mobile	Navi Mumbai	India	2026-05-31 19:16:13.51
1401fc66-820a-41c6-a021-8562a56a1771	page_view	/	{"path": "/"}	mobile	Navi Mumbai	India	2026-05-31 19:16:15.339
364c82f3-8069-46ee-b274-f617dba0ed3f	product_card_click	/	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Navi Mumbai	India	2026-05-31 19:16:22.389
3c02e7ce-a540-4448-95c6-d774261e29ed	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Navi Mumbai	India	2026-05-31 19:16:22.407
506b88ec-46c5-4929-a969-91eb26dad8ef	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Navi Mumbai	India	2026-05-31 19:16:22.416
3a945133-54e4-4fb2-bd63-bab47bfa651e	page_view	/	{"path": "/"}	mobile	Navi Mumbai	India	2026-05-31 19:16:34.131
80d9a662-ca55-4c39-b73c-5e9de04b5db0	whatsapp_click	/	{"source": "footer_whatsapp_block"}	mobile	Navi Mumbai	India	2026-05-31 19:17:13.764
a428d2d9-4c0d-40e4-beba-ad3821f8faed	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 21:09:30.859
be5c770f-1507-44ac-ae7f-3b449299cbf7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-05-31 23:15:43.593
d152da03-b755-4b11-837e-e140e458d192	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-06-01 00:43:24.054
7b0cf42d-6023-422f-8a54-3bc14d2be369	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-06-01 00:45:44.226
19fc2d4d-b438-4c92-8769-993e99f4832a	page_view	/	{"path": "/"}	mobile	Pune	India	2026-06-01 02:30:48.726
85d1bb2f-ad80-4d77-8478-60f44a0b8005	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 02:30:55.727
a3c157ba-e1c8-40a0-a728-f5a2951a1c37	page_view	/	{"path": "/"}	mobile	Pune	India	2026-06-01 02:30:56.548
92d4c3f1-e166-4435-9cea-1581bdb2268c	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 02:31:14.963
436eaece-03cd-4a06-878b-b0c78ca2cefd	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Pune	India	2026-06-01 02:31:53.012
0b31435b-a1eb-4ddc-b0c2-1f94d3592dfc	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Pune	India	2026-06-01 02:32:14.103
34879e1f-e3a4-437f-abf7-9176f46dc291	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	Pune	India	2026-06-01 02:32:18.834
ebc881a5-4654-4cfa-a1ee-48e5be02ddf2	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Pune	India	2026-06-01 02:32:20.881
8a8279dc-1d72-43ba-9bce-084d661061f3	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	Pune	India	2026-06-01 02:32:29.253
518851cf-9149-442b-96b0-a12e20674346	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Pune	India	2026-06-01 02:32:59.64
e73c7d24-4d2f-42e5-97bf-35785fdd61c6	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Pune	India	2026-06-01 02:32:59.646
9395da03-d029-4c7e-a034-7a0fad6e2741	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Pune	India	2026-06-01 02:32:59.673
e557caf5-541a-4cd5-8670-469f9e8a9f51	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Pune	India	2026-06-01 02:33:02.128
e88287cd-b039-4a1d-890e-8590f1408312	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Pune	India	2026-06-01 02:33:02.135
3d298d93-2157-4954-97e5-0aac128e5e13	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Pune	India	2026-06-01 02:33:02.198
8a593b7b-0df5-4f98-8720-a9e2f4f1feff	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 02:33:03.388
7c179624-8513-47d2-8ca0-de36aeaf84df	page_view	/	{"path": "/"}	desktop	Raipur	India	2026-06-01 05:25:01.572
6a6dddc7-2bfc-4ced-a414-bfbfce324561	page_view	/products	{"path": "/products"}	desktop	Raipur	India	2026-06-01 05:26:00.92
814244c7-9523-49c7-bd37-bae1b625c433	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Raipur	India	2026-06-01 05:28:14.692
c3f1f2a5-f759-4d7d-9cac-4c4a3c5cba66	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	Raipur	India	2026-06-01 05:28:14.694
4afd4d35-fc53-43b4-8e19-f411bcb344cd	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Raipur	India	2026-06-01 05:28:14.798
30ce1604-cf38-40f8-ba10-0ff47504bcc7	page_view	/products	{"path": "/products"}	desktop	Raipur	India	2026-06-01 05:29:03.989
1e513fec-9f49-4b60-baab-52ff27d22eca	page_view	/	{"path": "/"}	mobile	Pune	India	2026-06-01 08:53:38.172
c5c3f535-97e9-4b42-91a7-bd6b498395ed	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 08:53:43.495
ffe84bde-5e99-46a4-89d2-78f47d2635f8	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Pune	India	2026-06-01 08:53:53.74
9bba85f6-53de-41be-b010-419dff046b59	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Pune	India	2026-06-01 08:53:53.748
97aa63c6-6a93-4fb7-84a1-848bf74c433b	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Pune	India	2026-06-01 08:53:53.77
ce525754-22b9-4892-a8fd-58469250ad98	page_view	/	{"path": "/"}	mobile	Pune	India	2026-06-01 08:54:50.933
eb43fa31-a882-4f2a-80b2-a5d1cf6338be	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	Pune	India	2026-06-01 08:55:00.068
c6508cac-4eb7-4e85-9f9f-99848037b76f	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 08:55:00.121
27e9a798-9e90-437e-9356-ef492a9871f1	page_view	/	{"path": "/"}	mobile	Pune	India	2026-06-01 08:55:06.105
ad0c0e53-d128-4462-9103-ec9779ed10d2	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Pune	India	2026-06-01 08:55:06.45
ddbe4e9d-03f6-4b3d-8524-b1e9ef3a0b22	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Pune	India	2026-06-01 08:55:06.546
f7060a09-a4d4-4f59-b7c8-79284f434ea5	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-06-01 08:55:07.242
3588e4ec-03e9-46f6-adf9-d6b5fc8a89a7	page_view	/	{"path": "/"}	mobile	Pune	India	2026-06-01 08:55:07.935
62581b2d-bf31-402d-8424-e85f27d7c20c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 11:52:04.698
df489238-97dc-4349-8abe-65e05f13c502	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 12:32:14.287
12e4ec7b-04c6-4638-a8fb-c19d7dfeda47	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 13:22:43.461
0e7b28fa-87da-4f1c-9069-703a52f532a0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 13:24:30.344
54e94b56-e0a8-4a02-beb4-bd6cc3068570	page_view	/	{"path": "/"}	desktop	Lucknow	India	2026-06-01 13:40:04.954
e4c22673-9c7b-412b-a6ba-027426ca22a0	page_view	/	{"path": "/"}	desktop	Lucknow	India	2026-06-01 13:42:28.952
e8844316-5525-46c1-8a66-2cd13085d160	page_view	/	{"path": "/"}	desktop	Lucknow	India	2026-06-01 13:42:32.163
0695c929-51d3-49f8-ae9d-d09798e057c4	page_view	/	{"path": "/"}	desktop	Lucknow	India	2026-06-01 13:46:02.286
34b11412-0407-46fa-87ac-88ac8c018a51	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 15:18:04.075
d45783f0-4ab7-48a1-abe9-47f0e65d55ad	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 16:47:32.878
e556d5a0-1199-4e2b-9fc0-318227355370	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 17:24:15.36
3b888db1-f7a5-4212-a6e0-07188f04eac0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 18:02:58.276
8fb9e76b-fb7a-4c59-a136-3960be42034e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 18:21:50.138
7079b2ac-a5a2-4078-a768-4c82ea23836e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 18:26:57.46
831d7846-ff84-4d96-aa4d-3823957e78ac	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 19:21:27.924
1acdf33c-8015-4835-9767-62cb4829fe58	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 20:23:01.878
7d0eada5-35c6-4d0c-b855-1d95ea39aad9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 21:17:05.037
df8efb07-9205-4cc1-a5f8-91759ac12f8d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-01 22:46:19.297
82bf3b05-acd8-44c2-924d-9fae7ff32d12	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 04:36:13.584
4db21d84-1d5a-41f8-a8b5-d254af636fec	page_view	/	{"path": "/"}	mobile	Social Circle	United States	2026-06-02 05:27:41.337
a129ce4c-c482-4f80-8321-5939a8d74a57	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-02 06:20:30.863
6a089379-250c-4023-8124-6f53585c5c75	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-02 06:20:32.725
d647e9cf-186f-4241-bd7c-1071ba866521	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-06-02 07:43:17.159
9472e1a4-d6e5-4895-9d0b-63583c27d7cd	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-02 08:10:57.996
f0441932-11a2-433f-9689-16549ef9e1fd	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Delhi	India	2026-06-02 08:27:58.452
f6e30a50-dfa9-4343-bf67-9d8ea4b274e8	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-04 08:41:22.588
da5fd09e-0e9e-4ea4-89da-a0c5ffc820d2	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-06-02 08:27:58.485
d5a29e81-3ca6-4e20-bcf3-af2801e51919	product_card_click	/	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Delhi	India	2026-06-02 08:27:58.55
6f6eda49-b43c-4273-a900-00bd0a9b68da	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 09:00:12.031
906ca681-3066-4532-8fb7-1284c82cebce	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 09:14:00.491
297cbd9d-78ec-4da7-841b-ce233e66462c	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-06-02 09:46:25
f02a9c4b-2135-4d5b-8fdb-77c0061d4c2b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 10:39:10.288
adf6e2b1-0a16-4b19-a671-aeac4a02841d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 12:03:41.938
945e200a-385d-436b-bfdb-a8f9568a84d0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 13:28:40.479
38671846-f066-4076-9cb5-00a10872bebf	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-02 14:42:52.061
747c3a1f-279d-4414-9ac6-6146ca7b84b1	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-02 14:42:55.223
0af31665-c3c4-49c6-83ac-eeb55c8c196a	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-06-02 14:55:52.091
06e98ca6-0497-406a-af35-db1d508853c8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 15:42:51.27
d1d95df0-88b2-49c3-929a-2c16076f0a8a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 16:20:54.336
cd72d4a3-d798-4860-ae16-3d2c0fa11b46	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 18:08:53.853
76eaaae2-dc88-443a-88d1-9b9afc836a55	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 18:41:17.433
e7495483-9603-42fc-b245-ebfe5ef01556	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 18:59:32.37
18a20907-ec08-4507-856e-0d30847550e1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 20:32:21.448
61761a28-a997-4ab7-981f-e3c3d3190b78	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 21:27:14.949
42369fa8-e6e0-41e5-ab12-16e72cc10328	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 22:13:53.029
20c4fea7-e489-4a5a-be5f-33ef31736036	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-02 23:48:33.001
2abc7414-f5f7-4e41-a1dd-acca73df51f8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 00:48:10.511
9a9f4957-ea3e-44f9-823e-9616d2132226	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 01:23:48.885
12267b68-09c3-4f44-8f70-76cb7413ed3b	page_view	/	{"path": "/"}	desktop	Las Vegas	United States	2026-06-03 01:25:02.599
c88ca293-f637-44ca-9fbc-4a89976162d2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 01:36:13.534
dfce0ec6-bee4-47b4-a43d-4225d6a151a6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 02:00:12.611
25868360-9220-40d6-a412-e151536a7037	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 02:13:02.354
bd52411f-0136-4b01-bbea-04e7f7831263	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-06-03 02:25:13.066
3745a34b-0d1d-4c5e-b55f-56608c933e68	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 02:41:22.173
144988ce-5dcd-4408-82ae-b636becf7666	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 03:02:27.156
3c2c14f3-9dd5-477e-aab9-d49a1c3e158e	page_view	/	{"path": "/"}	desktop	Portland	United States	2026-06-03 03:59:12.143
ed958357-a723-46eb-8cd4-58d063941bbd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 04:09:54.156
a1eb56e1-8ef0-444c-95e4-21740c4b6ac0	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-06-03 05:17:09.406
e85eebed-cf01-48bf-b24d-9086d960afb1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 05:42:42.12
e4c6cc59-c844-4b02-bf27-57713195f716	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 06:03:11.821
97fa1fd1-abd9-4cad-8d54-802ffc579233	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 06:51:36.086
c1eab907-1485-4f35-b87b-04f702462f21	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-03 08:10:37.756
70049299-173e-485b-a18d-278e139918f0	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-03 08:30:20.4
6db9ed82-520c-4e80-8c6b-ad75be7ec100	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 08:57:54.676
5d883c77-73e3-4b1b-9df2-3d85303dae06	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 09:16:43.532
2b94874f-1c88-4d6d-a780-9d35513871de	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-03 10:54:11.17
5191a887-0f11-48ef-83b6-3c2ed95350b3	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 11:15:39.231
7828719e-4b0f-41c1-980b-72a20248412b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 11:44:17.506
57c99073-9950-41fa-a40a-74a726a8da73	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 13:46:30.864
87254c6a-5873-447f-ac6c-e567348a575e	page_view	/	{"path": "/"}	desktop	Frankfurt am Main	Germany	2026-06-03 15:08:05.875
d9386462-d6ae-4f0b-ae9f-3919233b8023	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 17:10:16.255
0f976483-21c5-4b97-896b-f34db227305d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 18:31:27.861
aeef1fb3-72b7-465c-b028-8e7f0228235c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 19:56:06.156
8ff718d0-0e0d-4233-bf7b-6545e7816ad4	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-03 20:40:17.026
831cfbab-0c8a-44fd-bc95-4bb84d46c7ba	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-03 21:00:18.638
144e6c23-897d-429a-9c22-75c527f672c9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 21:12:59.994
0ff18dbe-5f09-4c53-ab6e-dca1ce857713	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-03 23:19:08.66
639de932-2c29-4171-aa1b-36db2117f50d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 00:44:24.153
f15236a5-c079-4d79-9115-7f181baa805b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 02:45:33.543
a89fef09-c270-40e9-8aa3-3a577566dd52	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 05:23:57.817
8391f197-082b-48ec-a88c-006322259c55	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-04 07:30:08.058
10914dd7-4b33-4785-a772-18fec4bbc88e	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-04 10:43:25.063
3d083abc-70ce-4b24-947e-9903927dbb04	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 11:21:12.397
10bd77c4-9427-4b01-84d6-517a789fcaba	page_view	/	{"path": "/"}	mobile	Forest City	United States	2026-06-04 16:06:24.305
3be15a0f-27cb-4fca-a531-f2673986f347	page_view	/	{"path": "/"}	mobile	Forest City	United States	2026-06-04 16:06:27.076
09ee5bbe-6434-44a9-aa8b-ac5fd822e8bb	page_view	/	{"path": "/"}	mobile	Luleå	Sweden	2026-06-04 16:06:27.257
932b2af2-5b97-4876-9d2a-4eab45dc77e3	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 16:23:57.531
e0d96532-24cc-4293-b812-902a72ef227a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 20:39:31.461
af44dcfe-174d-4daa-97b9-91d8834683a5	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-04 21:27:24.087
ad22a2aa-2978-408f-bd6c-aaf059e0050b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 22:03:25.715
638fe42a-ac89-4f97-b4e6-6831c3783f91	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-04 23:29:52.118
b86c2d28-1c64-4824-8333-4cc794253a28	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 00:25:34.596
1556b52c-97ed-4492-9c18-90509ea8545d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 01:27:40.13
5509d9c7-69ac-47e3-b925-3ea9a1e56d25	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 02:44:17.137
b207901c-b9f9-4cdc-b855-7c79819c86dd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 02:58:37.881
3684d379-a4da-4855-940c-684665de030e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 03:13:29.369
82b84888-d223-4fc5-b2bc-d4eaa65bd8ae	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 03:28:07.22
0a8cf5c8-6679-4983-8a94-486d31fddbcd	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-05 04:06:08.575
229d8a67-daa5-4e66-a55e-481e0b0096bb	page_view	/	{"path": "/"}	desktop	Fort Worth	United States	2026-06-05 04:25:11.932
e0379538-62dc-49c8-b4c0-9c438f7b4eed	page_view	/	{"path": "/"}	mobile	Agra	India	2026-06-05 05:14:59.724
442d9235-2379-4ecf-b0a2-d80231537779	page_view	/products	{"path": "/products"}	mobile	Agra	India	2026-06-05 05:15:34.639
1923aed8-f956-4289-85d9-da320826bb3d	page_view	/	{"path": "/"}	mobile	Agra	India	2026-06-05 05:15:39.217
35503a0d-7e62-4c9c-92da-9f154245140a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 08:03:42.041
528f8a20-9db6-4111-8009-3342f60d537d	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-05 08:36:53.14
7505f062-dcc9-4af3-a42f-97819626264e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 08:49:21.112
f050fd80-1c44-4cb2-900a-59c658f3627e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 09:35:55.933
4300d2f7-042d-4238-800c-716e3f68169d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 10:25:21.51
2ec7f827-2ea8-4b52-b54d-ace3d65268f9	page_view	/	{"path": "/"}	mobile	Hamīrpur	India	2026-06-05 10:40:08.892
e1f09693-9162-4a6f-a9e8-13be57341626	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 12:01:14.293
d2d1d684-6444-4c1e-979c-d61dd9fc034c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 12:06:27.387
48cc4c89-de47-4311-90b4-ea30ffcb8959	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 12:27:02.511
3557d117-f785-4a67-af5b-24e8f2002fe1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 12:44:06.153
f6497bb3-840b-4347-ae4d-6a7dfa390777	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 13:02:33.585
8789882c-59ac-46e0-998d-d08755a1feb8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 15:43:57.5
4900741b-198e-4045-83cd-16e5a6d8b678	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-05 15:55:17.509
2eeab53a-6859-4cf3-87d8-6848126cc937	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-05 15:55:29.617
4ddc3d08-c13e-4511-a665-b7d2307e2a85	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	mobile	New Delhi	India	2026-06-05 15:57:16.08
c248375a-3a85-4876-a787-24b6be0bf70f	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	New Delhi	India	2026-06-05 15:57:16.084
7833404c-f98e-4083-8ba7-e1b0f306e3b9	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	New Delhi	India	2026-06-05 15:57:16.141
0b1712b8-e7e8-4bd5-8876-d1810c3479c2	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-05 15:57:32.681
47cac38d-800b-4f8c-9696-d9b03d8e1f7b	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-06-05 15:57:34.452
49822d9b-4327-4cf6-a4de-a74eb4233e4a	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	mobile	New Delhi	India	2026-06-05 15:57:34.513
f9a00cdd-ede1-4302-bb6f-9d8b6872ae9c	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-06-05 15:57:34.573
4d6ec1be-4034-46c3-9856-01bcaf80e552	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-05 15:57:39.675
46ff9369-6457-4be7-9302-065582aa7450	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	New Delhi	India	2026-06-05 15:57:47.065
a72a0adc-80f7-446d-b648-ab923e62eef7	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-06-05 15:57:47.066
fd800690-8c74-45e1-9dba-f7a2d49374f6	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-06-05 15:57:47.066
93f6bbce-e089-472d-bd16-6a2008da8b88	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-05 15:57:51.506
3cb6830e-a539-4ef1-a07d-b07c392a0287	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-06-06 11:19:45.073
f1bcead4-87ed-4879-9933-343aa8aae3d0	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-06-05 15:57:52.446
d9fad89e-35a1-42ea-aac7-e7d7f9576f64	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-06-05 15:57:52.547
5511afca-2976-495d-880a-86d979c3d2ec	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	New Delhi	India	2026-06-05 15:57:52.551
2a4b587a-6d06-4441-b01d-31c2ab29a9cc	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-05 15:57:57.648
168d7e99-60c9-4616-9973-3c713b55d94c	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-06-05 15:57:58.765
9f8e5357-db3f-4f83-a3f5-fe0cbb1a6539	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	New Delhi	India	2026-06-05 15:57:58.866
6a100362-b023-4e33-a95c-93cf95f0f0a3	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-06-05 15:57:58.869
0ddf8253-940f-4be6-a128-91092634d404	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-05 15:58:11.657
bb500d2c-1fb5-4618-bffb-a6e6c5c37225	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-05 15:58:11.759
2780a7b4-fbfc-4027-8315-084da549b4b7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 17:27:37.136
db240031-0ca6-49c2-8d66-63733c4bd2a2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 17:57:52.048
c3f7c77a-4490-4fb7-99d2-2375274f7f91	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 19:19:28.484
f9254cbc-7016-4167-826a-3c3af489b94b	page_view	/	{"path": "/"}	mobile	São Paulo	Brazil	2026-06-05 19:44:02.713
402dbca7-46c6-4d29-b323-d012367450bf	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-05 22:46:41.641
60fb668e-dea4-4327-b19a-d436f14ba12d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 00:31:05.968
63b7d428-859d-4684-8d36-2c7ed3a49dbf	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 01:40:40.781
97df2d79-5336-4849-bbc9-0457f54259ba	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 02:50:48.007
e675d05e-9963-4a67-a405-ff66368a0686	page_view	/	{"path": "/"}	mobile	Chuna	India	2026-06-06 03:41:08.924
5ead8bff-1514-4b08-8916-75202ebc0dfa	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 05:31:36.037
4a4233a6-c2ae-4597-a8f5-4f02617cee6a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 05:37:37.57
3e781066-9f6d-4fce-afe3-0ca05434f9e6	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-06-06 05:44:34.639
22b3d044-fe21-496e-8503-ae86b710f934	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-06-06 05:44:56.765
552e13fb-4878-48b8-a1ca-9674f76fc2a0	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-06 06:13:40.064
a186d060-0e52-4274-9416-1bc13f4c3eae	page_view	/	{"path": "/"}	tablet	Mountain View	United States	2026-06-06 06:18:16.452
be5cf1f4-0b73-4584-a9db-105d91f2071b	page_view	/	{"path": "/"}	tablet	Mountain View	United States	2026-06-06 06:18:17.196
267e67c7-ecee-4bb8-9307-daf38efa36b7	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-06 06:19:57.036
e989d055-a798-4aaf-92ed-d2584f6d6335	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-06-06 06:32:13.411
276af121-d157-4a16-b17b-fc3f65122bbc	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-06-06 06:32:13.845
665afcec-1b82-43dc-a94f-ca97c860bab6	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-06-06 07:07:42.834
173277e2-4f30-4ded-bd99-b2ba91d79bb2	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-06-06 07:07:50.855
cad311c6-022b-4285-ac79-2d4c7e650ba9	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-06-06 07:07:54.629
5f616048-d814-4f7d-9589-2ccd1ea3f185	whatsapp_click	/	{"source": "hero"}	mobile	Jaipur	India	2026-06-06 07:07:55.498
ad44316a-59b4-48ed-8c44-3f1c05fdbf38	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-06-06 07:08:20.518
265c1b53-4a9f-4f6d-abe4-5853de016504	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Jaipur	India	2026-06-06 07:08:28.849
24758f20-d7b8-4598-8624-26ae9f1b8dee	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Jaipur	India	2026-06-06 07:08:33.724
2b05ee0e-bde9-45f9-84ac-0d84785c7422	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	mobile	Jaipur	India	2026-06-06 07:08:33.735
9623e184-1249-453f-b208-ff7366d01fa1	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Jaipur	India	2026-06-06 07:08:33.815
8e9e519d-62a4-4b78-a496-60b365b489df	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-06-06 07:08:40.241
0d8c959c-b327-4d57-a456-0386fb02cfc5	whatsapp_click	/products	{"source": "footer_whatsapp_block"}	mobile	Jaipur	India	2026-06-06 07:08:43.351
882aba63-a771-4db7-b78a-5c2abcc12139	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-06-06 07:08:46.666
25978a3d-45e6-4b17-bac5-5eb3fd6b31d1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 07:31:11.928
87ad60ea-a01b-48f4-af4e-1d9dfb8e14df	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-06-06 07:38:00.145
8eb97fa7-da00-4c0a-9719-5424b66ab37f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 09:20:54.574
3960c30c-909d-4934-8802-89230300979b	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-06 11:18:48.06
1c288f12-9604-4438-bcb3-c0a71000b7f6	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-06-06 11:18:50.015
4bc2b8d5-624f-4806-be79-04aa32fc541e	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-06-06 11:19:42.104
c925b33d-625c-4e2f-86b4-2bf06778f7fd	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-06-06 11:19:42.118
6d4d2dba-034d-4b0c-9750-abf86db795b4	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-06-06 11:19:42.119
a5ca7f88-658b-4e9a-a7da-56b3e10a54a4	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 11:29:57.108
69e087e0-78a9-42d7-a4be-1ce49535a28c	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-06-06 12:39:22.988
b56011d2-4a5a-482e-9086-f46ea36e831b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 12:58:00.573
6910d8f3-94b5-4f28-9b9d-e8ae69951246	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 13:46:40.036
06807fa4-87b5-4774-9431-bf3156aa05f9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 14:25:42.786
cbfcbe20-3d2f-4898-981e-77c48a07cbd9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 16:40:01.606
0e99e39b-cac4-4a72-8202-b2b416036d40	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 18:07:07.906
d077456e-1e32-437f-8aa4-9fdb0a749847	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 18:59:00.44
24a37256-5d5d-43ba-866a-d1fe17b63144	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 19:43:09.569
c4d40bc1-ed2b-4d66-8581-4c070c4ffe63	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 21:23:12.107
644f3614-a220-49fd-952b-d3c9c84fce7b	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-06-06 21:31:03.025
e7855e84-2a9e-410c-8821-afb1aad93eb9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 22:58:10.074
2836b82c-04b5-463a-b490-63950f81105f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 23:03:04.461
667ff320-9955-42c4-b36b-4272522b4035	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-06 23:59:34.589
66be5f63-3fcc-4095-9300-fcf5ee57e956	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 00:09:23.564
d86ef94f-84bd-49ef-a5b1-7e0bc5116d49	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 01:33:20.319
e3c73f03-0129-4ea9-949a-138a49fcf498	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 02:01:49.722
3841f2be-94fe-478d-9c57-af782d921129	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 03:03:37.914
e27c3200-421e-4c1a-98e1-3bdd17027bd9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 04:35:12.384
fcb2fc40-7fe5-40ee-9579-cf2c825b976b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 04:59:42.581
02e8c7e3-1b97-4f7d-b6a0-8609f248140e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 05:19:56.427
8fd48ce5-266f-4855-adab-8612883f0e94	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 06:11:53.968
cc0f7d53-97fa-425b-b4b5-492f60c788bc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 07:09:31.107
e1758967-c66c-4b1b-9b7f-a162b28f82a6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 08:24:05.652
c9520439-59af-45f7-a3fb-74c78ff78b1b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 10:31:13.808
39086207-f534-4a20-97fc-759b853f9fa9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 12:32:10.83
d36e5861-d283-493e-ae4d-5ec64ff3e9d0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 14:14:46.588
ffb9972d-14cd-43bf-a5e6-b65ded638408	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 16:38:30.829
5ca4b4f9-b1be-4793-aa20-a7863004db93	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 18:19:29.476
c9d94db0-43a8-431e-b9aa-0775575f0a95	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 19:47:57.51
562ddd01-33c5-4d06-a80c-a0c220a03936	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 21:39:12.046
bd167325-5364-4e6c-8150-8d2eb4e1d8c7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 22:01:21.818
c21b53a2-8dd9-427d-84d7-942494556f54	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-07 22:59:10.478
0f84a16b-81a0-4e51-a03d-84c2365f0a8b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 00:07:06.005
0f508074-d128-4cac-8ff1-5f0afe0e0542	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 01:02:55.11
0457b521-c8d2-4367-9537-60a70839d32a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 02:38:41.851
603fc033-9d3d-479d-b3fd-caca4400a3b8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 04:31:21
28b648b8-8cbf-4564-90b2-f3167479d323	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 04:53:08.856
fe40a3db-2426-4a96-9754-213f0d7072db	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-08 05:48:36.577
7e78bd50-7458-4e8c-8e2a-7be04f1ebdc7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-08 05:50:59.423
798e9a88-36d9-4d41-88f3-debb11b4ce69	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-06-08 05:51:15.48
e96266ec-3311-4b8d-b4e9-0169238a2cf8	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-06-08 05:55:30.228
ab5201ed-d2f5-43fc-bf11-e7653087957f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 09:47:53.062
06a1ad9c-d225-4e9e-8dbc-f3dc785afb79	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 09:52:23.139
a17bc59e-385f-4f35-8148-4f40ac6c0c58	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 10:17:55.736
e7a01802-4701-4904-b1f5-608de7e2758f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 10:39:05.119
c8a79f74-6f17-4c83-9059-1fa73be44743	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 11:16:26.554
1fcd1291-c8a2-4291-a771-2fb82bd88e42	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-06-08 11:21:12.743
9c87595c-98e9-40b2-9af4-4495d6d90bbe	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 11:24:15.532
bbd93f3e-c7ef-4de2-a8b8-4ef6bcdca9ab	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 12:34:55.691
0bacaf5a-8d68-4dda-baaf-6837a2d9fe61	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 12:54:34.467
8b24ece6-9be8-494a-a23a-06279af86f11	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 13:31:57.762
f6a0815a-bcd8-4af0-8722-521d3f51cf7e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 14:23:19.24
8311efae-10b4-4d25-b0cc-c80c65f7dda8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 14:58:00.488
8b5cddb6-c8b3-4703-bccb-6ebfe1d065f5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 15:43:27.481
7d25e130-0016-45e2-961d-a56b45b77558	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-08 18:51:30.883
ac6b87b5-520f-48a0-a71d-1d80863cd27d	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 04:13:05.41
25e7638a-c9ae-4a67-be22-eef3f460973c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 05:12:16.728
e571379a-7f5f-41d4-b978-86d4c648410a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 05:39:18.582
461c3a22-8ef5-4b2b-bbd6-ac8e230fbd9f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 10:59:36.806
05287eca-9728-4241-84d8-e6c1db1ffadb	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Lucknow	India	2026-06-09 12:11:34.477
1c6c2869-9867-4cab-90fc-4e031a56d8b6	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Lucknow	India	2026-06-09 12:11:34.502
d3f53405-4b96-4e5b-8fe6-95f9c16045f8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 12:31:31.3
aacb57bc-09ac-4631-a29a-7de7f6842183	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 13:54:07.633
cbb4883f-f46b-446c-b648-6f35c478efdd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 15:57:45.572
afb45cc9-676e-4145-af87-9ec692fea23a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 16:35:29.257
9cbd3985-4c25-4c17-afe0-50220d7ba06a	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-06-09 17:46:14.54
14391193-de0c-4bfc-9a8d-a7204fdeb873	page_view	/	{"path": "/"}	desktop	Oskaloosa	United States	2026-06-09 17:46:35.344
32b04184-b62a-45da-b225-8228dc35afa8	page_view	/	{"path": "/"}	mobile	Oskaloosa	United States	2026-06-09 17:46:36.268
709ff470-43f5-414d-b51e-c12836b602e2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 18:41:50.161
9fe5fe57-49e3-40ed-9bb7-2655cd68052e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 18:45:52.335
99bf9d9c-8c5c-45cf-815c-c90276fdc615	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 20:14:16.941
56afca86-2c17-4ff7-8628-6fb342dc466b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 21:29:53.294
e16c5dc2-a611-42ab-86e6-900abee53bfd	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Oskaloosa	United States	2026-06-09 22:15:13.862
9ccbd0f2-bbaf-4bb7-8825-decf4151ca4d	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Oskaloosa	United States	2026-06-09 22:15:14.792
07b86b39-94c1-4350-baca-2f79ca423386	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-09 22:45:30.306
b1486bcb-53d6-4b19-913f-9707a91b81a8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 00:35:49.518
535af844-463b-4b33-be5c-5defe8d84073	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-10 03:43:05.657
30ce3e52-c0c6-4bb9-875d-75131a4cf1d5	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-10 04:10:33.848
7b815367-2e4f-4c69-8522-c8546ec85377	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 05:41:07.281
a1d6d86b-17dc-48db-93a9-5c0db29c9650	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-10 08:29:46.277
de3e2dff-913d-436e-a247-83bd2bcc0901	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 08:56:34.506
f3eee015-1b35-42fe-b7f4-99e8c8dea516	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 11:33:59.313
2f76f3d4-7c97-4063-8b4e-70d6b4abca07	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 11:58:21.451
127d906c-ad20-49f7-87ac-a4cb804a3090	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 12:28:52.537
7633c439-32e4-47a0-aced-871d789bdc67	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 15:45:21.134
a8cbfe30-b519-4d0b-a23b-b9b132b38ec2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 18:13:57.92
aa22cf20-4393-4f65-9479-a4f5bb897363	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 19:54:42.21
25623272-b746-4728-a412-01c2a820ee5f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 21:29:39.657
e66ff528-f530-4227-bc3a-814932d2abf6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 23:14:08.05
f5b1ab0f-d05d-4a3f-8b1a-3a7527582ea2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 23:23:32.336
02a291f1-3e9f-4098-893a-31f26bb86b62	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-10 23:55:04.764
121095bc-f3ce-4240-95c6-71ff8c795bfe	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 00:38:46.471
16d17d25-e98f-48e4-b7e3-5927f7549659	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 04:03:57.419
1fe3fad2-0e31-451f-bddf-b4a77fc66fe1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 04:05:38.886
ea7d94a1-284b-4b05-ae86-dc80bae2c3fc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 05:53:02.434
636ff2d4-2df6-4e1e-8e1b-d94ccd589d1a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 06:12:28.672
ba3a14ce-0688-4cb9-a901-751af55b32bc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 07:51:32.842
3d1a4c5a-8dee-4e0b-9c55-af82a8e100bf	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 08:44:43.889
0ada953a-7b24-44f0-a173-614f255f3ba3	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 10:55:11.242
26e8916e-ba1c-420a-8684-b8ea8d219a73	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 11:20:24.738
5a77ce4f-6d44-4659-bb75-c710dc2075a1	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-11 12:49:51.65
e59c63f1-67d5-44cd-a067-cf79e4609403	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-11 12:49:53.119
5d3e85fc-cc1f-4ae9-a43e-c4ac48fab0da	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-06-11 12:49:55.15
fbcd59b8-1313-4ecc-a5b3-689c1e982ebc	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Delhi	India	2026-06-11 12:49:55.231
7ab4b518-f7e5-44bc-a2d9-2e65db9e59ae	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Delhi	India	2026-06-11 12:49:55.264
9abc213b-33f4-481d-8696-83a542fc2dc4	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 14:16:57.382
48d96e0b-fd70-4aa9-b101-48298dc07258	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 15:13:51.045
21fccecf-1424-4071-b658-82ebcfae312b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 15:27:22.188
16374478-c019-4643-8cdc-8a4d6d1aa096	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 16:09:30.977
9e233e58-530a-42b3-bea6-ed3d1f950140	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 17:03:11.936
3c7d2e61-c081-4a91-ac61-8a3016e31a51	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 18:00:44.149
e88d41ab-b617-4b6b-8b81-bde1be2d2b49	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 19:49:49.196
2abccc8d-cedf-4226-8682-da11f0017f29	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 20:51:27.868
2d48b8f1-0b96-42de-a8b8-61782c8cdebb	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 21:21:37.057
177817c3-220a-4c6d-8253-0f5e90696cd5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 21:24:12.861
97beb4a7-1f2c-4aee-ae22-a71f84240220	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-11 22:21:08.968
909deaf3-a158-44cb-a177-456ae6081cd7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 00:10:19.12
0887507e-dd39-48fe-b465-2ac9ae5cb0e8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 00:32:14.746
261e0651-f893-4818-85fe-3e380d0d7be1	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 03:34:20.643
15fecf71-7002-48d4-b029-233e430bbcff	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 04:04:31.722
141a40cf-c4bf-4e54-806f-1f903e7d2313	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 05:59:49.428
41b96cb1-e5c1-43a2-8c9d-48224c3ca18e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 07:23:19.058
533439a5-0687-4bcc-8dab-56a3de69aed5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 11:02:27.635
6f08394a-dc12-416f-ab8a-81f904df24fd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 11:46:44.724
f57e8dbd-4a55-40b8-8215-59aadf94c2cc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 11:50:59.825
94bac96f-908f-4714-8b1a-a2f350968c2c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 16:02:48.993
295786c2-16b9-4fd4-bee4-eb6830228d25	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 16:53:20.027
516ebb1d-dfd0-4cb0-a9b7-97b7c755bb96	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 16:53:36.435
ecd4bfdd-0407-4bab-88ff-9b0da346e71c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 16:55:36.415
b23b28d2-a6aa-4eea-9ce0-68019c04d5fd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 19:08:25.664
84086d88-2cf4-4783-b156-5f434d6a0bf7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 20:07:24.982
27610f8b-c634-4e88-b2b3-483d11c2bcb8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 20:28:28.73
c59e9abe-f7ad-491b-8f9e-274a719447dc	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 22:00:11.95
2585f9c6-a65c-4c1c-a074-88613e799e96	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 22:39:45.101
08faedc2-7968-4ac4-b8f0-501b3cfa6166	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-12 23:24:29.422
61759f9e-1d6e-4b0c-a7c5-5e0dfd76bc2d	page_view	/	{"path": "/"}	desktop	Quincy	United States	2026-06-12 23:52:23.034
f1278a38-7ef4-431b-a057-002f24b295a6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 00:38:35.749
78da8124-8994-4c60-859c-ce7791319533	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 01:01:44.354
583e873f-156a-4894-8a30-0b954105a4b7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 03:22:18.699
9ca88621-f6b8-4784-9162-dfb3ee1eeeb5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 03:26:13.645
11ca78cb-339c-46a6-a1fe-2e934e301887	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 04:49:02.461
7ab974fd-ab77-4d57-9a88-60740a80f686	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 05:41:41.777
fc9a5856-e409-4d7b-9785-33bf43a82c8f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 06:13:03.071
7fe274e6-001b-46c5-ad7a-85ef7b2f101e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 07:31:27.137
0917200a-34d5-4f72-bda4-a8ae67a0a830	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 11:10:14.424
3552693c-6814-4e32-859b-d274f0113df2	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 12:29:14.092
62f1aaf2-7a13-4de6-8a7f-3ac355ddfb27	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 12:37:54.757
5028279f-88b9-43eb-95b0-66b20805ec2b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 13:53:55.188
5ac2750b-55dd-4fd2-9758-98a88f159ba7	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 14:14:49.768
17002ecf-3a29-4286-80d3-250f61c723da	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 15:29:34.48
71d1e5bb-4ba2-4009-8225-8ba0a2daa0ac	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 15:53:23.097
7356afd4-aafd-4fbb-ad98-fac5485179ea	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 17:35:28.401
915da9d4-6550-4972-a5ae-956b3418a759	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-13 18:33:26.488
8f8953ea-6ee2-4848-9baa-fa1017ce806a	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 19:42:50.095
0b8480a8-7f10-4db0-b652-55a0e92eeb1d	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-13 19:49:20.328
6f0ba268-4f63-4327-8c91-0da613bf0055	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 21:31:00.499
be84a7a9-b967-4468-8d9c-1c7e32c48a4c	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-06-13 21:55:25.828
d4efe192-da06-44dd-9ab2-d6d562747352	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-13 22:35:24.105
0fcddb1e-22ee-401e-aeb6-7e0e11bb4b67	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-13 23:56:26.845
607932ee-ef2a-40f8-a6fd-62239b766ab4	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-14 02:09:00.865
8b2b3ec8-6fd5-494f-ba0b-25e53ad13040	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-06-14 02:09:01.326
c4d89146-ad46-4dfb-bafb-cca5429b7607	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 02:58:44.334
20385dfd-9888-4e1a-ad5e-e6b771f978e8	page_view	/	{"path": "/"}	desktop	Prineville	United States	2026-06-14 04:37:53.687
bc314ada-b809-47be-86d9-0a383dedb7c4	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 04:43:25.515
45eae708-fe72-474f-a19e-c7331b99b244	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 06:47:09.411
738e6e02-8a6d-48e4-bb91-64d06d130a74	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 08:55:00.185
3c2a1724-1054-49c7-bb53-b8467925a1fa	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 11:25:18.156
0380eeda-7539-4632-b738-1cc38cbbc03f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 17:59:13.119
a9548119-c2e7-49af-8512-ddb84e31c1e5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 19:13:33.925
091e0cd1-1915-4893-8c5e-f36d1afe95b5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 20:00:06.432
b9895c50-0fc1-41be-a20c-8840a2b3fdf8	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 20:53:34.189
05656184-da7c-47a8-a989-03ddbb609400	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-14 22:39:09.958
6cb6f3c3-ded0-4244-9c8a-b4f15ab91d29	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-15 00:30:08.685
0caaad72-170f-4d84-ae9b-5f7ae7673699	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-15 06:56:31.976
76e79b56-d50d-4835-9def-029920af446e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-15 18:54:54.571
87926224-0902-483f-a7a2-3ed61fab2fb6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-15 20:48:42.358
c3385999-959e-4ff1-8318-ec00f52e78bd	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-15 22:11:32.676
93e28c66-200b-4c49-a548-53e24d9ab227	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-15 22:46:36.089
d469891b-fe1b-4cb4-9bac-33d45716d958	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-16 03:48:34.012
2ee42b98-628a-4770-8653-9d20f494fc81	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-16 10:24:03.824
d20ae1f5-224d-4d54-8e7c-22d6248c89ff	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 10:24:05.388
cb51f21a-408b-457b-a76d-4c11ebc05f8e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 10:24:23.57
a5ce0965-c033-46a8-ab13-f53e9eda8600	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Delhi	India	2026-06-16 10:24:25.593
3d80cbc9-c890-4096-82a8-14b3260d5f73	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Delhi	India	2026-06-16 10:24:25.671
86ac1885-6372-4a09-9bff-3f9fa6f699cb	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Delhi	India	2026-06-16 10:24:25.729
2e423ce4-d51e-41ad-ab6f-e964d073d544	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 10:24:56.225
ec6fc4fd-1d7f-42b1-aff8-6918e3874c82	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Delhi	India	2026-06-16 10:25:27.174
efa1530f-74b1-4275-9290-c7e28e352528	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Delhi	India	2026-06-16 10:25:47.324
49cae20a-92e8-43a4-9a99-f7d7005cbdc6	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	Delhi	India	2026-06-16 10:25:47.345
011ee70b-677f-422c-9c75-0b4b7a67aff0	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Delhi	India	2026-06-16 10:25:47.346
ce853b8c-7ea7-4d2e-8a18-492fda4d9272	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-16 10:34:10.292
bb250967-3029-493f-aa3e-0458375df113	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 10:54:58.234
3b5035af-374f-4850-9231-4beb4b3b3631	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-16 10:55:00.682
bf6f795a-433f-4ac8-9936-3b61e18c0f05	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 10:55:23.578
167182b0-0a13-49fc-baa9-b2d04e565f66	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	Delhi	India	2026-06-16 10:56:01.481
10315139-7a4f-4b6d-b64c-50f024282080	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 10:56:01.486
8b2e5955-e554-4b10-bab9-dabcc1ec7b08	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 10:56:01.498
23cf9c74-eca2-4eb3-9a8c-5ca9d0782e0d	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-16 11:04:32.726
cad579bf-0888-4db5-bd51-ab356b734c9f	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 11:04:33.246
e2388f7f-8e7d-45ed-8aef-2a0e2ca6be9f	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 11:04:35.841
956d0ab3-1255-46c7-890f-27937e0be876	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Delhi	India	2026-06-16 11:04:35.918
ccef42a9-f312-459f-8bcc-26e81a7f2159	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 11:04:35.96
9fed738b-4965-4fed-87d9-53a9acd19048	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 11:08:58.565
9d82a9b9-250a-4534-aa12-a30d6c336917	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-16 11:09:08.727
ed33f08a-0f84-444e-b1e8-7c093ba08b58	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-16 11:09:19.847
deb938d5-b845-4bd4-9a90-dc30a21a7bee	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-16 11:09:21.199
8eb68403-b9d8-4d27-ba5c-46511d39d021	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 11:09:31.542
9a86dcf7-bc31-4212-9971-d09f506ce535	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Delhi	India	2026-06-16 11:09:31.55
8f7c726e-cdd2-4f1e-88fd-9a2540b42cd9	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 11:09:31.558
a288f040-aa7a-4500-844d-e2ef2bac69f1	page_view	/products	{"path": "/products"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:01.737
1b29d312-1e97-4bf1-b141-326a215fe2dd	whatsapp_click	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"total": 10500, "source": "product_page", "quantity": 50, "productName": "Oversized Tee Bio-Wash.", "pricePerUnit": 210}	desktop	Delhi	India	2026-06-16 11:09:34.724
68466713-eb4a-447f-8afd-516f8502ad25	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Delhi	India	2026-06-16 11:11:35.38
51e3e495-4699-40d0-a32f-64fbf49f094c	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Delhi	India	2026-06-16 11:11:35.402
7df85c39-6a58-40b9-bce5-ab8a4c40a382	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-16 11:14:42.958
1c57c2cc-6c56-4143-b2b7-85b75abbbee5	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-16 12:00:11.9
319f2e87-652f-48ad-a468-50d2f1bf3281	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-16 12:10:49.142
86d2304c-99cb-4d19-a821-0fa2f08c0952	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-16 12:50:37.011
5a8793b8-e9a5-4bd4-b076-b4b581392de6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-16 14:26:47.372
2725377f-3d23-4f0a-947c-cc4e2d8d9fbd	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-17 00:36:05.319
1e314f58-52c7-43fa-88e7-58e6a83fd4b9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-17 11:28:01.136
cdc33583-208d-46e5-a51b-6dd7cee847af	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-17 12:55:56.816
c90864e0-6a51-41a9-9747-304128a05fd0	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-17 13:42:26.552
2a7fde12-61e3-4245-bad8-74ace05f5761	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-17 14:58:02.018
2a168ba4-72da-497b-a760-98eb63086c33	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-17 15:43:01.204
2abd2fbf-beeb-459e-8e09-c90010084f8b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-18 11:36:16.149
eebaffa3-0a94-4f21-9768-1125023bec45	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-18 12:44:44.126
6e0ef3b6-6706-4ed1-a78b-95178b0ef4b9	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-18 13:32:20.387
b8a80f4e-81c5-45b2-ad94-abf260a738d6	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-18 15:10:21.781
433d43fe-0fb8-4bfe-b2fc-bd7445a12cf2	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-19 06:50:35.199
4609b17a-19e2-450e-9268-07635241e90b	page_view	/	{"path": "/"}	mobile	Noida	India	2026-06-19 06:58:53.999
fdb473cb-f689-46a9-bfc2-8d1cd6ffafdf	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Noida	India	2026-06-19 06:59:01.572
c1f01a82-3876-42c4-bbab-fc86838a124e	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-06-19 06:59:01.577
272747d8-4b43-498e-9524-bf743c03578e	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-19 06:59:17.617
3730dc46-ab6f-47e0-a03a-70611bb8cf1f	page_view	/	{"path": "/"}	mobile	Noida	India	2026-06-19 06:59:30.84
28bbec55-dd90-405e-b72f-e19291827f1d	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Noida	India	2026-06-19 06:59:34.155
d453b4da-7e95-42e2-9998-2455fba1180f	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-06-19 06:59:34.381
d28ad98c-e9d0-4db2-a69e-b2db57fb9b9f	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-06-19 06:59:37.699
4857ef18-3ac5-454d-b5cd-3902a14199bd	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Delhi	India	2026-06-19 06:59:39.561
f19b1eaa-2239-4c03-ab93-da5d1c663e94	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-06-19 06:59:41.041
9a2ead37-53fc-47c5-aa2b-e5f95db6f527	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Delhi	India	2026-06-19 06:59:42.215
f40d0784-7902-4d21-a7bc-2b18a709a3b2	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Delhi	India	2026-06-19 06:59:43.16
bb3acfe8-8b3e-4f4b-86e5-8bf7c6a4a0a0	page_view	/	{"path": "/"}	mobile	Noida	India	2026-06-19 06:59:51.381
0291f1d7-a0dd-496c-8951-42830d940e28	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	Noida	India	2026-06-19 06:59:57.031
0718755f-337a-4e43-a5e9-ddac9b486480	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-06-19 06:59:57.056
44ae4d99-6970-4f2b-899d-791b074dc525	page_view	/	{"path": "/"}	mobile	Noida	India	2026-06-19 07:00:05.201
a136e8ca-db34-4217-97d3-72938244ab30	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Noida	India	2026-06-19 07:00:05.809
11c0589d-af83-47b8-8ba6-c8cb75ccb78f	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-06-19 07:00:05.894
50a3f0dc-a22d-40f5-a0cc-37e3777c4108	page_view	/	{"path": "/"}	mobile	Noida	India	2026-06-19 07:00:16.456
eedf58ec-1c1c-415d-ba41-c449927f6331	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-19 07:10:15.113
08827811-5bd6-4571-afa9-10ea38643871	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-19 09:33:56.758
372ff4c7-71a6-4668-8a06-208fb61e55e9	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-19 10:26:25.805
a82c97a0-b8a4-49cd-8430-43c59f8ac922	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-19 10:26:30.673
a82c8f0d-4637-476c-a1eb-11f2e2912de8	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-19 10:26:32.435
eee5a834-e369-4894-9bc2-2248f15e9f5c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-19 11:40:18.228
5a9e6cd3-31f6-4964-a85f-a0947985cc30	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-19 11:55:52.155
86e8d616-201f-465d-876e-283987996e7e	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-19 13:36:14.502
f718a019-82a4-47de-b1de-1b9658753d8c	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-19 14:46:02.654
76e0144f-0a43-4bca-a308-22c49d4437ea	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-19 15:48:23.635
35208ae4-9f4a-4d97-8791-35ab813c9f2f	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-20 05:27:43.29
4215dc74-37fa-4d07-86ed-c5ea0fc7307e	page_view	/	{"path": "/"}	mobile	Altoona	United States	2026-06-20 12:42:55.522
0577d870-e341-45fc-b18e-92bfaf5be42f	page_view	/	{"path": "/"}	desktop	Luleå	Sweden	2026-06-20 12:42:58.277
ba06f714-a6d5-4f5c-a0b3-bb37fcb7f479	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-06-20 18:43:45.031
2b3eab2f-3de8-4e2d-96e2-9636fa3f00d9	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-06-20 18:43:49.226
9ec08b6f-fb7e-4ca9-bb6c-50ac42c998e4	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-06-20 18:43:49.261
441a5f64-fac0-4b1a-876b-c807e0b8f73f	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-06-20 18:43:52.985
4f32d026-727e-4195-b9bf-6d8587273a29	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	mobile	Lucknow	India	2026-06-20 18:43:52.999
ee1ee0a0-291f-4443-8be2-177dc085117f	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-06-20 18:43:53.066
ef9ff79d-a02b-41ad-9a23-9fad45e8a6dd	product_card_click	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-06-20 18:46:23.681
c43027f5-10d0-4f74-b071-a2dbe40f1efe	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Lucknow	India	2026-06-20 18:46:23.681
c60b00d2-89cc-4b7b-a97f-bef49257d870	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-06-20 18:46:23.768
6ab1a846-25ca-4dd0-93a5-4b652ec92f57	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	mobile	Lucknow	India	2026-06-20 18:46:46.84
b55434c5-cb22-4c8b-b91b-fa8c1e7b6a00	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-06-20 18:46:46.853
dfed509c-a401-4868-b146-387869dabad5	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-06-20 18:46:50.132
641dd693-92d1-440e-bd63-f22de57df86c	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-06-20 18:47:04.874
63c8c670-c574-42da-9a9e-7efa9015fddb	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	Lucknow	India	2026-06-20 18:47:04.897
e9154d15-d221-4b76-9069-b43b2cda381e	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-06-20 18:47:04.904
06aeb04c-0a75-4448-8ee8-aabf928f3e52	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-06-21 01:02:54.515
49b663f2-5263-4882-ab69-1f8ab2b6e0a2	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-21 03:46:56.191
5311c97e-8172-4aaf-92c1-52348f06a59c	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-21 06:17:35.257
319e2ada-7748-428f-bd96-68fd03091268	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-21 11:16:55.083
21ff07fb-02e0-4871-87d7-3bb6faef45d5	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Mountain View	United States	2026-06-21 13:46:57.3
ef7d1507-6cd4-411a-a6ef-e19306549945	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-06-21 13:46:58.365
9d4887c2-87da-4995-a22d-69699665a5ab	page_view	/	{"path": "/"}	desktop	Boydton	United States	2026-06-21 21:48:00.256
6e0dea11-adc9-45dc-9672-5ab7b45ea8ed	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-06-22 10:09:55.189
9648ee72-a562-4ff7-83d3-1d5efbd87b7b	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-22 10:10:16.337
2da9b049-5926-4864-bd74-3b3a8de2f7f8	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-06-22 10:10:19.578
a20d4ef0-a8c2-4f57-b568-72e0efd686d4	page_view	/products	{"path": "/products"}	desktop	Gurugram	India	2026-06-22 10:10:49.815
2d9f21d9-0373-4cf3-b9e8-71ff9e1d2b70	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-06-22 13:17:25.492
521eab0e-5463-4224-8827-3acff825fb4f	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-06-22 15:15:16.169
5d22c7dd-1ea9-4026-8587-072646bb1d15	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-06-22 15:15:47.185
f77ddab5-0858-4596-bf70-db6f8de545cb	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-06-22 15:16:19.264
4be6617c-27ec-48f9-b113-52ec24310e89	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-24 08:12:39.733
37a8ad4b-e76a-4194-9563-10a9fd6f3e07	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-24 09:25:54.844
22dec257-d065-40ec-8ac0-57e7d2e24229	page_view	/	{"path": "/"}	desktop	Forest City	United States	2026-06-24 13:22:16.46
49fe4553-9e9d-482a-a3d9-e0792cd21aeb	page_view	/	{"path": "/"}	mobile	Prineville	United States	2026-06-24 13:22:23.356
ee407770-4b37-4c15-8418-792c06907c94	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-06-25 01:52:24.877
45818b16-b169-4b54-ac0e-a8c44c6176a7	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-06-25 08:32:04.46
0bbf4133-67f7-424d-8a34-02840f5ce7ce	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-25 09:58:56.688
b0caa078-961c-48ad-b310-c2f9a686df4d	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-06-25 09:58:58.857
0de33bf3-12b4-49bd-88bd-ac27d920eb9c	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Mountain View	United States	2026-06-25 16:48:02.544
0ab0873a-9056-450e-91d8-492c88f91bbd	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-06-25 16:48:03.061
c2325aaf-f329-47e9-82b9-b773b4d9d1b5	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Mountain View	United States	2026-06-25 16:54:03.035
df572d27-a427-4d69-819f-758807f0eb8e	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-06-25 16:54:03.492
41321a6a-74dd-43b2-9a62-ddc48873a47d	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Mountain View	United States	2026-06-25 16:58:04.842
f77266fc-b672-405b-a102-43e32eeda276	page_view	/	{"path": "/"}	mobile	Kathmandu	Nepal	2026-07-12 06:06:45.992
6c5b6ac8-3be5-4082-81aa-311abc809ef4	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-06-25 16:58:05.349
fc8e305b-99c1-4479-90aa-651884318a17	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Mountain View	United States	2026-06-25 17:05:47.907
02717fd0-f4f5-47de-818f-ef3af649de55	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-06-25 17:05:48.286
df384113-d955-4b3d-bb50-6da070c182c4	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Mountain View	United States	2026-06-25 17:06:05.912
5f78cc4e-49ec-41e4-8da7-5cb0cb2a2a55	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-06-25 17:06:06.323
17f2ce13-2803-4d7d-abc9-04da762be3de	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Mountain View	United States	2026-06-25 18:54:46.354
71bd01d4-a200-4869-8ffa-ab4ee70df50a	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-06-25 18:54:46.66
59f60670-5b74-45c1-ae1a-73ac10c18dc8	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-26 01:28:10.8
ed642434-13cd-4c1c-a9f8-e8a6d6f03b74	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-26 11:38:06.879
e7a20f3a-f504-4307-8aa4-39bfe03426df	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-06-26 11:38:14.486
77413427-f07d-4d4f-bac0-48b95ca52c43	product_card_click	/	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-06-26 11:38:14.49
53974091-3cb7-4f30-b536-ff3188a17228	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-06-26 11:38:14.571
11ab5f93-e7f6-4553-832d-4a127cf6e1e5	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-26 11:38:17.365
e46a4ae7-3bd8-4c4e-951f-eff4a67c302f	page_view	/	{"path": "/"}	desktop	Unknown	—	2026-06-26 12:12:02.294
1b83e2e7-ce40-4d80-bb15-c16010072c21	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-26 12:49:11.738
3fe455e0-0e3c-4876-a19d-2fba191bfb3f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-26 13:53:41.449
776a3fb3-751f-409a-bd7e-8ccce401d98b	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-26 14:45:52.595
6a4ff5a3-4e07-4f39-b5cb-5d9cacfd2c0f	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-06-26 17:01:41.051
f53bdc07-1367-480e-8842-4c60b4a64f59	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-06-27 08:34:56.724
5fe42ed4-a931-48d8-9745-1b40125dcd50	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-06-27 08:35:03.933
d75cbc8d-8376-4d72-a81d-b27a729edc7e	page_view	/	{"path": "/"}	mobile	Chennai	India	2026-06-27 12:34:55.76
84c4089c-0b18-4a7b-88b6-f6784a4f0bea	page_view	/	{"path": "/"}	desktop	Forest City	United States	2026-06-27 13:55:05.454
97e0bfc4-7672-4e0f-a986-964b3a82eae9	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-28 08:09:27.063
89d0a275-1e9f-4608-b4c9-b53a6fd69de5	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-29 04:15:03.976
47ef1000-f790-4a68-baf6-0e1d663b9330	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-29 04:52:06.821
85c2cb4d-7205-4f30-b0bb-212a71df4b65	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-06-29 06:47:35.252
413ffeea-7368-4067-94c8-8922d416006a	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-29 06:49:00.94
3ac693b0-2be3-4eb2-ba71-2d662a85c498	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-06-29 07:49:27.648
ed6053f1-019a-440e-9e78-0e1b6b9d8855	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-29 08:58:00.869
198f127b-3940-41b5-aac8-4fa297f2b8ac	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-29 09:30:25.741
5bd414e7-276f-4b76-b148-8e158c23ea64	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-06-29 09:30:43.922
9c81dba6-699d-4edc-affa-d995e2f43d29	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	New Delhi	India	2026-06-29 09:30:47.392
bd8c281d-4b72-48a3-914b-2e4a4d8411f5	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-06-29 09:31:12.309
6635a2d7-d8a5-4075-9446-9656d55a32d5	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-06-29 13:53:14.093
8f6b781e-67cd-4bbd-8cd8-930a952e7dad	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-29 22:37:33.727
0e8f36c0-a08b-40c0-aeb7-72d6ce4dd038	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-06-30 05:52:34.458
bddae130-2648-4f4c-a97a-da5fbb5605c3	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-06-30 07:52:53.906
3d900e7a-d315-440e-9733-bb5c0c0c0551	page_view	/	{"path": "/"}	desktop	Atlanta	United States	2026-07-03 11:49:49.275
d4b0ca92-e3e2-4f28-8d55-f0694eeec0aa	page_view	/	{"path": "/"}	desktop	Atlanta	United States	2026-07-03 12:11:33.074
a76b7ac2-9b0d-40d3-8d55-f56d63aa8c3b	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-04 06:40:04.699
669bdb40-4b7f-47ea-8c77-f8b95f380fde	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-05 04:54:21.559
5ba29e5f-78ed-4da4-a43d-b2722db3485e	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-07-05 04:54:23.492
a1681c23-9a74-47df-94a6-98ccbf3fa61c	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-07-05 14:29:27.211
829fd3bf-d865-406f-8a08-445bbd96bf42	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-07-05 14:29:35.945
3953353a-992c-4594-8e99-5fc435df22c2	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-05 17:02:08.63
8c192d6a-59e7-4b1c-9111-15ea41c7cfef	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	Guwahati	India	2026-07-05 17:02:38.423
310361db-59d7-47bc-bbe2-5987572f2ac4	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-05 17:02:38.426
f37c3c03-ab13-49f3-ad3f-333e649ed67f	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	mobile	Guwahati	India	2026-07-05 17:02:55.001
eb854838-67e1-4909-906a-c82f9c9922e9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:24:38.729
4062c5a0-e2e6-4a73-aff7-55a28b735bb6	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	mobile	Guwahati	India	2026-07-05 17:02:55.043
ec73d16e-1eeb-40a6-92c1-62cf7ff5de62	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	mobile	Guwahati	India	2026-07-05 17:02:55.063
83e76c42-0f12-4dcf-becd-3d2b538163ec	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-05 17:02:58.783
24b08d8d-b02a-4ba5-ad35-7891344c1afd	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-05 17:02:59.718
1c66ff79-e056-4545-8413-d915894e587e	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Guwahati	India	2026-07-05 17:03:04.96
7291da27-9d51-4fc5-a19f-01995d1bc091	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-05 17:03:04.983
9e6169f9-f4b0-4d1e-b1f5-fdcf5c67d0e0	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-05 17:03:10.227
55e3ab2d-714e-4723-8a31-e8a5de8fdfa6	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	mobile	Guwahati	India	2026-07-05 17:03:15.831
f7713b20-21ed-4862-9c5f-92edeed4249e	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-05 17:03:15.847
465869c1-a012-4e2d-808b-9ba059f65580	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-05 17:03:18.536
a27603ee-8b53-4f03-9ba2-51200ede4a0f	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-05 17:03:21.521
9d97fac1-957f-4cfc-a1f6-0892b9f0f1ee	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-05 17:03:21.587
87684f90-7e4c-4716-b2a0-e65d4da2689f	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-05 17:03:25.896
9f12ef51-f294-4bea-8a7c-281b66b9936b	page_view	/	{"path": "/"}	mobile	São Paulo	Brazil	2026-07-05 23:27:38.641
9f36b527-5398-4382-933c-9278476e0d67	page_view	/	{"path": "/"}	mobile	Muzaffarpur	India	2026-07-06 02:08:10.406
ecefdd85-cc3a-4133-9fd9-3e7de41a29d5	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	mobile	Muzaffarpur	India	2026-07-06 02:08:28.186
35ff3d13-564f-46f0-824a-95aaa81e2111	product_card_click	/	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	Muzaffarpur	India	2026-07-06 02:08:28.196
7b60e7e6-b62b-43b5-8e1e-294bb7cac0da	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	Muzaffarpur	India	2026-07-06 02:08:28.202
8366d264-c913-4abf-8d10-d23cb276fdcf	product_card_click	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Muzaffarpur	India	2026-07-06 02:10:06.689
7aa41560-75b0-438f-be80-b5f6afe2d5aa	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Muzaffarpur	India	2026-07-06 02:10:06.693
6de5adde-7b4b-4209-bfba-3d7b31a1bdb7	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Muzaffarpur	India	2026-07-06 02:10:06.74
a864a2c2-7d0c-4fa7-8bad-18c7d0be2389	page_view	/	{"path": "/"}	mobile	Muzaffarpur	India	2026-07-06 02:20:00.218
84587c44-8ab1-44d8-ba0d-bb0e8ea92e3b	page_view	/	{"path": "/"}	tablet	Ashburn	United States	2026-07-06 05:08:02.962
2f8e34a2-cf90-4e8d-981c-d079ff818e76	page_view	/	{"path": "/"}	mobile	Chennai	India	2026-07-06 05:58:43.861
ce70ec4b-9e3d-4c6e-8d7c-dfe5c8b7d3d4	whatsapp_click	/	{"source": "cta_banner"}	mobile	Chennai	India	2026-07-06 05:59:09.091
cb9b8879-bbb3-4a42-a9bd-e3f8c0f9688d	whatsapp_click	/	{"source": "footer_strip"}	mobile	Chennai	India	2026-07-06 05:59:17.663
9089404e-0847-4576-a750-999fb51d828a	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-06 09:47:30.284
78bf363e-33f9-4e1c-926d-283b4b2bbe45	page_view	/	{"path": "/"}	mobile	Patna	India	2026-07-06 20:39:06.995
ed53d497-f9c5-419e-bf94-99b217ddb13d	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-07-06 20:39:10.297
1961880e-c6b7-43c3-9474-b3780069d43f	whatsapp_click	/products	{"source": "footer_strip"}	mobile	Patna	India	2026-07-06 20:39:57.819
c324746b-4bdf-4540-9c56-1677e8add868	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Patna	India	2026-07-06 20:40:15.459
22f1f219-b4b0-43c3-b8be-9f671c6ae02f	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Patna	India	2026-07-06 20:40:15.524
733a40f6-12d8-4882-a1cf-18aeb4f7ca5a	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Patna	India	2026-07-06 20:40:15.808
7a1f60d8-d18c-4663-bda3-0910f21b757a	whatsapp_click	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"total": 4750, "source": "product_page", "quantity": 50, "productName": "Round Neck 115", "pricePerUnit": 95}	mobile	Patna	India	2026-07-06 20:40:30.111
013e02da-ff88-4baa-b656-8bd12967320d	page_view	/	{"path": "/"}	mobile	Patna	India	2026-07-06 20:40:37.795
89e4cca8-76df-4a01-a651-ea2b38a48bbd	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-07-06 20:40:40.712
7146f94b-35e5-4549-afb5-997638414f85	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Patna	India	2026-07-06 20:40:45.14
b4492fe8-b026-4c62-91ad-2bc53ab404fd	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Patna	India	2026-07-06 20:40:45.223
af69eb9b-db91-42ae-9183-70f2ce117875	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Patna	India	2026-07-06 20:40:45.265
3d41e432-3d66-45ce-8bb9-b146870b8802	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Charleston	United States	2026-07-06 20:42:39.001
83504d92-79d1-48a2-8b18-58d1fa568087	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Charleston	United States	2026-07-06 20:42:39.006
3bbf1de9-a0db-469a-9ec9-20e652ddcfea	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	The Dalles	United States	2026-07-06 20:42:39.151
232e284f-c1a0-4b3a-9654-3e47eec6b10f	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	The Dalles	United States	2026-07-06 20:42:39.157
54736101-8fbb-4097-88b4-0e218c013d77	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-07 01:48:06.018
eaf563f5-df7c-4cf2-a81c-9d007a022d27	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-07-07 01:48:15.881
86c3d4ce-0e90-4acc-8910-9d83ce65ea27	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-07 01:48:15.974
417c9d8b-12f5-478e-9c7d-023c2e258820	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-07 01:48:34.051
2182e8ce-c24d-4d65-917d-c9938e48fabd	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Lucknow	India	2026-07-07 01:48:36.222
292ad258-3f73-4c8f-acc7-cbb2656e553b	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-07 01:48:36.325
1eb0788c-813d-4494-9124-3cd1a66f8dae	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-07 01:48:48.615
c29b2f2c-451e-4d88-997e-ddf835858205	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	mobile	Lucknow	India	2026-07-07 01:48:54.203
1af6a23b-ade5-42b6-9287-05a73bccacb3	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-07 01:48:54.221
a145911e-ea97-4b25-8835-9a95b92653f2	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-07 01:48:58.399
604ecee4-4aea-49a3-8195-dc3fcfc4202c	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	Lucknow	India	2026-07-07 01:48:59.237
7aa57cad-475c-470e-a24d-2eafd109d65d	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-07 01:48:59.34
3a42dd09-9d7d-4475-9694-f587fdd968af	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-07 01:49:02.88
5ca78522-fc34-4024-960f-99795d45a928	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-07-07 01:49:04.238
5f2566f7-cb91-4964-b5d5-b7986fd91e26	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-07 01:49:04.331
2e00af0a-a53d-42aa-96da-e7fd92e34392	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-07-07 01:49:08.234
c601554e-efdf-4343-a25b-e4a8604e2691	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	Lucknow	India	2026-07-07 01:49:08.268
92062e3b-9eb7-48f4-981d-8279ecfd0823	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-07-07 01:49:08.354
36f6851b-216d-4870-b6b3-1060bb8251e5	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-07 01:49:50.692
5b278457-4232-4fb6-a14f-b814d7e6f8f7	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-07 01:49:51.479
395beaeb-0d3d-43fe-b41a-893b8a8c030b	page_view	/	{"path": "/"}	mobile	Haldwani	India	2026-07-07 06:17:45.811
fb8cd853-06d0-468e-bdff-1fdb35397ceb	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Mountain View	United States	2026-07-07 06:21:10.488
3bc42ae1-e81e-48e6-83f3-426c5cecf54b	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-07 06:21:10.773
bee82131-12ae-4c83-9e74-8d1858b9049a	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Mountain View	United States	2026-07-07 07:09:27.022
5113e4d6-c445-4c17-affd-a31a04cae62b	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-07 07:09:27.414
8dc2bfb1-94b8-494e-a4d1-6e7ec85d88c5	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-07 09:47:36.684
089ff2d0-c33c-4e9f-8cb3-4edfbf46ea3a	page_view	/	{"path": "/"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:51:53.656
629aeaf3-8708-44c0-ab56-12757a8c1064	page_view	/products	{"path": "/products"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:51:56.669
63d16bc4-f383-46ce-b50a-9986d5b81f0b	filter_applied	/products	{"value": "2", "filterType": "minGsm"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:05.899
62e135b1-3980-4c9d-87f8-09b130157df8	filter_applied	/products	{"value": "22", "filterType": "minGsm"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:06.348
442981ca-102f-4793-87ba-5fd947274cf0	filter_applied	/products	{"value": "220", "filterType": "minGsm"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:06.503
87f0de0c-4954-4a70-8778-d5e7f07299a5	filter_applied	/products	{"value": "Bio-Wash Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:11.302
b51966c4-77aa-4e00-8ff0-553740df46f7	filter_applied	/products	{"value": "Bio-Wash Cotton,Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:12.873
0020f1bf-067b-4e46-89fc-ae94c25881bd	filter_applied	/products	{"value": "Bio-Wash Cotton,Cotton (100% Cotton),Lycra / Stretchable", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:17.156
241af6f0-aec8-413b-b571-904d501251b0	filter_applied	/products	{"value": "Cotton (100% Cotton),Lycra / Stretchable", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:19.072
7e0b1d3e-bf5f-4c62-bad4-47ce4bbaed82	filter_applied	/products	{"value": "Lycra / Stretchable", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:20.037
4bee4859-26a5-4f92-85e2-b731a7e42d67	filter_applied	/products	{"value": "Bio-Wash Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:23.458
ca0890bd-5215-4df5-9685-e01914e027f2	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:25.769
e0c744c2-d8b6-4b0d-b2e3-0cb5812fe76c	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:29.613
62680250-3a9c-4b45-a808-9b0bb0420cf7	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:29.697
1f4f1b3b-8645-4a1e-81f4-06c70a596f84	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:52:29.698
ec99c86f-a98a-4941-a81d-74a438801b20	filter_applied	/products	{"value": "Cotton (100% Cotton),Bio-Wash Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:05.273
e912f46b-e4ab-44eb-8db0-43245372dec7	filter_applied	/products	{"value": "Bio-Wash Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:06.079
e74f2395-25a1-4685-b889-4f6fe3e11bae	filter_applied	/products	{"value": "Bio-Wash Cotton,Terry Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:09.151
daebeba3-6dbd-4327-8eef-9c246d3c4c83	filter_applied	/products	{"value": "Terry Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:11.332
42dac572-c8ed-4bc4-b771-3125d5ca2ee2	filter_applied	/products	{"value": "Terry Cotton", "filterType": "fabric"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:13.496
e96ee003-7b56-4e14-9831-040adf70ffd6	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:15.553
de0c7da9-8084-426f-ad49-26332e8b9011	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:15.632
122cb05c-21c4-41f0-8de3-cccde191c21d	page_view	/	{"path": "/"}	desktop	Gurugram	India	2026-07-23 06:16:33.439
df6c1c92-fa41-4fcd-89c0-515e1c22a6a6	page_view	/products	{"path": "/products"}	desktop	Gurugram	India	2026-07-23 06:16:34.372
867c8917-8ad2-4750-8afc-68479c7a0ff8	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Gurugram	India	2026-07-23 06:17:05.621
208ed874-f3d3-4580-853b-fe5943eab82b	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	Gurugram	India	2026-07-23 06:17:05.654
1bff8190-5a4d-490e-bdca-057ecc2c20ed	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Gurugram	India	2026-07-23 06:17:05.664
b58b5ab2-ddcc-4f8d-844a-56954596ca60	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-23 06:18:21.928
080d6052-7699-4ffb-b95f-6196e520f119	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-23 06:18:21.951
7f77706a-9aff-44ce-8ee1-6c48fab47f24	page_view	/	{"path": "/"}	tablet	Ashburn	United States	2026-07-24 07:01:24.55
0118064a-394d-43ad-9ad7-4d712ce03814	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Mountain View	United States	2026-07-25 02:14:21.427
747dee25-218f-45cf-a426-72f0b824b6a7	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-25 02:14:22.355
e7bd7858-5315-4ec6-9f99-e0f7af1df234	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-25 11:14:21.728
ef3121c5-26c8-41c2-a2fa-4960d4908b03	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-25 15:17:13.493
5f16fc1e-835a-441f-a348-9d434bcbe58f	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:17:13.583
ce4a2c68-bf2c-4b5a-9b47-b04a643e7278	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:17:17.467
1103bd7e-5a2e-4f7a-b015-f812b968d469	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:17:46.075
db08dd13-b252-4d1e-be0b-7eba59b19128	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:18:34.608
b47985d7-8520-408c-ac5a-ea6f890c4056	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:18:46.434
8f0d7ca3-9821-4b1a-b9c7-2b3321621953	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-25 15:21:18.4
654c1cf5-ed79-42ab-bd8d-222a618fcfd7	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Noida	India	2026-07-25 15:21:18.416
a2bfa01c-b432-409e-9f47-19e652ea6b51	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-25 15:21:18.55
69fb8bda-7b61-4d9a-87fd-b61bc7af92a3	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:21:45.28
2ffa08cb-2ec0-47f7-ad81-3b49cc000308	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-26 06:43:13.369
6c48d25b-86c1-4c21-821d-9f8163ee23fe	page_view	/products	{"path": "/products"}	mobile	Dehradun	India	2026-07-26 06:43:14.502
c4c55853-1fa8-4d9e-9470-0399cc423b2a	page_view	/	{"path": "/"}	mobile	Bilāspur	India	2026-07-26 07:04:53.982
bf3cc6e0-45af-46f2-9f81-7382eda10759	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Bilāspur	India	2026-07-26 07:05:05.136
ade39f53-bcdd-4445-9170-bc186b7cd932	page_view	/products	{"path": "/products"}	mobile	Bilāspur	India	2026-07-26 07:05:05.168
8089cf94-a35a-423b-86be-483c6c5a1a67	page_view	/	{"path": "/"}	mobile	Bilāspur	India	2026-07-26 07:05:19.276
3423a858-9aa2-46f7-846f-ef370222b33d	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Bilāspur	India	2026-07-26 07:05:20.923
c0d56e78-4e4d-464f-a17e-dece895b1f84	page_view	/products	{"path": "/products"}	mobile	Bilāspur	India	2026-07-26 07:05:21.007
d1dd3fed-15ee-4cdf-815d-10f42f028ecb	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Bilāspur	India	2026-07-26 07:05:28.388
c779769f-f6a7-4780-90a0-aa9ab921fab7	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Bilāspur	India	2026-07-26 07:05:28.401
0021982f-e4a1-48ad-8171-a610995e4245	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Bilāspur	India	2026-07-26 07:05:28.408
ac740534-760a-4878-aac8-f92dfcc93b84	page_view	/products	{"path": "/products"}	mobile	Bilāspur	India	2026-07-26 07:05:44.122
37a4a035-ecba-442d-a51e-0de951fe16fa	page_view	/	{"path": "/"}	desktop	Saint-Léonard	Canada	2026-07-26 13:05:22.402
4a764bc8-5c3f-477e-ae71-a37dc400e4a7	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Nuneaton	United Kingdom	2026-07-07 10:53:15.633
ffb8008e-c2ce-4cdb-89df-d5cd5bfb5770	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Mountain View	United States	2026-07-08 12:02:07.415
c3f2da30-0404-4b08-91bd-8e081b4d0375	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-07-08 12:02:09.019
de6077e4-e158-4568-8eee-dde698e75db9	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-07-08 12:06:44.24
cd486243-5208-4cbe-8f59-f2d881b9df65	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Mountain View	United States	2026-07-08 17:59:18.287
929310c9-ae8f-485e-99d4-ddc0f60ed92a	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-08 17:59:19.031
88bdabf9-c592-421d-a412-d6404bb775e8	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:16.16
edc61268-5d2b-47e3-a905-e11e7aaca40f	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:16.197
0e80d5b6-2def-4d5c-be7b-ebcdbc0e3093	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Bur Dubai	United Arab Emirates	2026-07-08 20:49:17.397
6aae1147-b0e1-4214-8b09-49db7faf7dca	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Bur Dubai	United Arab Emirates	2026-07-08 20:49:17.453
35fb6044-d5be-4877-bada-3c0261215d82	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Kabul	Afghanistan	2026-07-08 20:49:17.981
30b8be65-bf12-4dbd-aa81-82ead4a3fdb1	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Kabul	Afghanistan	2026-07-08 20:49:18.218
e96f27e3-1c93-415c-92fc-6f537fbd446c	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:19.323
6ca81502-dd39-4849-bbf2-368c91ee8493	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:19.326
d1d20e44-67da-431c-9d0a-70029e729059	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:19.65
c08aa956-a03a-4aa1-8eb7-49517ce14b80	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Bur Dubai	United Arab Emirates	2026-07-08 20:49:19.808
a43651ca-77ce-4a5e-9b7a-a9a5478f658e	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Bur Dubai	United Arab Emirates	2026-07-08 20:49:19.838
1302dbf5-b1a6-4863-97c4-f7828eba96ff	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:20.022
746fa86b-3809-4ae3-abb8-7ca71f7a877e	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:20.8
89ec558b-2f3e-4bc4-9e13-f6e3a3bffe28	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bur Dubai	United Arab Emirates	2026-07-08 20:49:20.82
8b7c8b38-4501-40d5-8069-d9714b446de0	page_view	/products	{"path": "/products"}	desktop	Cupertino	United States	2026-07-09 00:19:02.057
999cfc5f-f748-4b62-be45-2c0d1a81564a	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-07-09 11:19:38.032
1e7f188a-07ab-4f01-968d-b5c1bfb5772e	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Mountain View	United States	2026-07-09 12:57:41.112
0ab8dd3e-436c-4eb5-9142-1cf362af891c	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-07-09 12:57:41.412
9567e3af-b32e-40df-8527-78aef3561e23	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-09 13:40:42.932
28272ce3-a026-4c36-a31a-fccbfc7281c7	whatsapp_click	/	{"source": "hero"}	mobile	Lucknow	India	2026-07-09 13:40:47.13
3720903e-60b0-4a92-979e-aa4a30670204	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-07-09 13:41:13.422
079fe1af-7ea4-4626-a22d-db03b9ec6893	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-09 13:41:27.654
d630b4c9-60dd-4edf-9c39-7fecd47098b0	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Yerevan	Armenia	2026-07-10 02:06:01.534
dc69741b-3e2b-4830-ac8d-0fde9a01e1d0	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Yerevan	Armenia	2026-07-10 02:06:01.688
c11bba0e-4db9-45c4-a42a-6d1b4640ff86	page_view	/	{"path": "/"}	desktop	Dallas	United States	2026-07-10 12:26:44.807
c22ced55-8366-4ac5-a990-688a41c34dac	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Kabul	Afghanistan	2026-07-10 16:42:35.601
848fada5-57bc-4471-88a5-258c9b3d7824	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	Kabul	Afghanistan	2026-07-10 16:42:35.644
03c1ab46-2d83-4fb6-b15d-643244f0fe2b	page_view	/products	{"path": "/products"}	mobile	Kathmandu	Nepal	2026-07-12 06:06:56.511
53a6e465-846d-458a-9aed-62714b574768	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Kabul	Afghanistan	2026-07-10 16:42:35.759
7d2b194b-d509-4c02-90ac-a877f0616674	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Kabul	Afghanistan	2026-07-10 16:42:35.768
9769acd3-ffff-479e-b049-d8365004dbdd	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-10 17:32:28.669
32af0b89-91a3-4500-8000-10f0863d9ce1	page_view	/	{"path": "/"}	mobile	Pune	India	2026-07-10 18:36:19.121
24641cc0-817f-4ac7-a1d2-f4c2afa961a6	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-10 20:58:55.056
a2e1d429-38f3-4125-b57c-b33481fc251c	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Mountain View	United States	2026-07-11 01:57:24.316
68c64c66-c886-48cd-b249-f7e5881f3a35	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-07-11 01:57:25.2
781f4643-e604-4eaa-902c-932ee7b61bb4	page_view	/	{"path": "/"}	desktop	Boydton	United States	2026-07-11 07:52:20.752
8292947b-0eec-431f-ba54-ee2768446b8b	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-11 08:25:24.244
a346a77b-90cd-45bf-b456-cf63649ef945	page_view	/products	{"path": "/products"}	mobile	Lagos	Nigeria	2026-07-11 08:37:02.135
0bde687d-8561-4440-8543-9434c3ad0fae	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-07-11 12:58:15.967
6c314311-318d-4206-b78f-69e1ef23d4f0	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-07-11 12:58:19.844
d0253575-0e92-4f77-b6de-1483de52ecf1	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	Cupertino	United States	2026-07-11 16:51:18.02
c7b0c4d1-8228-4dc6-bd49-39cac5e8df24	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-11 16:51:20.935
ddb1c5c4-6876-4c4b-a7f4-3260245278bc	page_view	/	{"path": "/"}	mobile	Jammu	India	2026-07-11 19:23:11.01
acad8ed3-286d-4db8-bd18-1c0b0ce50e6d	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Cupertino	United States	2026-07-11 19:26:30.481
48124375-41d9-4ef0-83c3-93196b2425ad	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Cupertino	United States	2026-07-11 19:26:31.909
78ab2625-6889-4899-b117-67ea9acdd8df	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Cupertino	United States	2026-07-11 19:46:07.396
e5af6727-cde1-46d7-b2a0-d1476601c1f9	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-11 19:46:10.265
8d2f748d-2fe5-4802-9382-bd78da275c53	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	desktop	Cupertino	United States	2026-07-11 21:00:13.114
0b199802-5792-482f-a7f8-0b146a8110d0	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-11 21:00:14.546
f2137870-2de7-435e-95ce-07da6c7e8007	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Cupertino	United States	2026-07-11 21:28:28.189
1363eb3f-c8d3-425a-8adb-8584114271df	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Cupertino	United States	2026-07-11 21:28:29.625
9e7a3581-da99-49c6-8034-a1d1396cdd48	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Cupertino	United States	2026-07-11 22:22:16.602
6ffe2fe7-0134-4b1e-a1c9-b3be84844511	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-11 22:22:17.99
6b370d73-8290-4f00-82be-23559592a020	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Cupertino	United States	2026-07-12 00:11:19.69
4c3a436e-b6c3-485e-9f83-c1aea4c5a671	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-12 00:11:20.995
26cdae08-e037-460c-b5b0-a3228c802bb3	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Cupertino	United States	2026-07-12 01:39:11.091
6759b3ad-ba7e-41ef-bc69-3825d3fcb067	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-12 01:39:12.47
ffed1678-392b-4757-8b65-23fd11ea5356	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Cupertino	United States	2026-07-12 01:47:39.586
b9a265c4-4882-4238-899a-9eb8ed340517	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-12 01:47:41.023
6b9834f7-0a59-4eb8-aaed-8e6ed4afab51	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Cupertino	United States	2026-07-12 04:15:25.641
3a5badc9-03e6-401a-b1e7-e3ee2bb28601	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Cupertino	United States	2026-07-12 04:15:27.026
588b3cbf-406d-4b67-9b78-4f98118c1957	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Cupertino	United States	2026-07-12 04:44:32.114
bf99cdab-56be-4b85-b2f1-40e12ace0510	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-12 04:44:33.501
4c5452b3-4076-4ec9-9887-7aec5a1fabd2	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	Kathmandu	Nepal	2026-07-12 06:07:38.307
77b0a8af-61da-4121-b2d8-0fbca652d19c	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	mobile	Kathmandu	Nepal	2026-07-12 06:07:38.312
6ab6e227-0294-475f-a39e-6257a6e91c77	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	Kathmandu	Nepal	2026-07-12 06:07:38.409
cf7b3068-cb9e-4484-be27-7ca00d87cf13	page_view	/products	{"path": "/products"}	mobile	Kathmandu	Nepal	2026-07-12 06:07:46.678
f3efe9a9-5352-40d8-9fca-b0fc561622c6	page_view	/	{"path": "/"}	mobile	Kathmandu	Nepal	2026-07-12 06:07:54.955
18719c96-b9a4-494f-9121-2340b134b4ce	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-07-12 07:10:33.447
3dcf815e-c3f8-4750-b664-f266f9579635	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-12 07:19:10.198
b2dc5a1e-d2fc-42da-b8fe-575c35347e33	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Cupertino	United States	2026-07-12 08:25:25.736
ef4b89a1-1335-42dd-859e-ecc1deb0faad	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Cupertino	United States	2026-07-12 08:25:27.166
2d38c20e-7f36-45eb-8a33-b6e2a290eb59	page_view	/	{"path": "/"}	mobile	Mumbai	India	2026-07-12 10:41:00.004
48c1c922-372b-45da-8117-46359e825024	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Mumbai	India	2026-07-12 10:41:10.593
83718dca-2198-4d0f-adb5-597ad61a0a92	page_view	/products	{"path": "/products"}	mobile	Mumbai	India	2026-07-12 10:41:11.056
50136f8d-a940-4166-aa8b-7fc83df54258	page_view	/	{"path": "/"}	mobile	Mumbai	India	2026-07-12 10:41:11.336
5e43c78f-b1fe-4024-905e-c348f56c9353	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Mumbai	India	2026-07-12 10:41:23.156
2dd73858-2341-4360-b322-43a9d184e0e8	page_view	/products	{"path": "/products"}	mobile	Mumbai	India	2026-07-12 10:41:23.243
f1767635-46a2-45bb-9ae8-26c51275917f	page_view	/	{"path": "/"}	mobile	Mumbai	India	2026-07-12 10:41:45.364
4585c669-9fff-4202-ae96-7a5997a1ccc3	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Cupertino	United States	2026-07-12 15:06:03.884
a6639637-67c8-4fb3-bf51-a1df897fb5d1	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Cupertino	United States	2026-07-12 15:06:05.309
6631bbb5-2f01-4837-9ac2-c4f9d819004e	page_view	/	{"path": "/"}	desktop	Burnaby	Canada	2026-07-13 07:22:58.585
bb241c49-ab49-4b8e-bd41-c04879532fff	page_view	/	{"path": "/"}	mobile	Pryor	United States	2026-07-13 11:06:54.233
e96ab124-270c-4014-9060-76e1d79309d5	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Cupertino	United States	2026-07-13 15:52:56.469
e4b66219-d1d8-4367-a49f-ba656ec15064	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Cupertino	United States	2026-07-13 15:52:57.807
57e880a8-1488-4eba-b5b9-2671edae0dff	page_view	/products	{"path": "/products"}	desktop	Cupertino	United States	2026-07-13 15:53:15.674
ea90c6ea-4010-46bb-8d09-e5b3c27d24ff	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Cupertino	United States	2026-07-13 16:51:43.945
c5703853-5f26-4ead-9f7c-6fdef4882fd6	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-13 16:51:45.331
8e27704d-75c3-4ff5-b405-ee73978f97bf	page_view	/products	{"path": "/products"}	desktop	Cupertino	United States	2026-07-13 17:30:43.371
0b2813dc-a03b-49c4-84d1-4f4e08f48842	page_view	/products	{"path": "/products"}	desktop	Cupertino	United States	2026-07-13 18:06:21.193
e3da6ff8-f796-4ff0-976d-0e4f53a2d288	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	Cupertino	United States	2026-07-13 23:37:51.244
bf1cd0d9-8bd9-41e5-b046-ba79529702b7	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Cupertino	United States	2026-07-13 23:37:52.59
5ac9f220-33e3-4ad2-aa24-d5523b88ee45	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	desktop	Cupertino	United States	2026-07-14 03:12:49.886
28223624-c726-4e98-b862-d84185712d7e	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Cupertino	United States	2026-07-14 03:12:51.316
f50e3881-5f74-4dec-886c-38e6a03cd6f6	page_view	/	{"path": "/"}	desktop	Kochi	India	2026-07-14 05:08:55.528
dfe92d10-322d-437a-8a74-b779e5f2c3a2	page_view	/	{"path": "/"}	desktop	Kochi	India	2026-07-14 05:09:54.528
eb224414-884c-44b0-a94f-f0634bfe7189	page_view	/products	{"path": "/products"}	desktop	Kochi	India	2026-07-14 05:09:58.83
f5d6378d-4b9c-4bd1-b686-d19c28852eb1	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Kochi	India	2026-07-14 05:10:11.866
e56d249a-c79a-4c6f-a7d1-13797f53bdf8	page_view	/products	{"path": "/products"}	desktop	Kochi	India	2026-07-14 05:10:13.351
769f4cb2-c7ee-4438-9335-ca33f542d174	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Kochi	India	2026-07-14 05:10:34.41
16e7a513-f799-4fb6-b9c9-a42c731b05ed	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	Kochi	India	2026-07-14 05:10:34.429
f559372b-a252-4e0d-8e30-3c9b5dddddc9	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Kochi	India	2026-07-14 05:10:34.479
06693b81-018b-4c8b-9c19-7e42b9e776d9	page_view	/	{"path": "/"}	desktop	Kochi	India	2026-07-14 05:10:48.757
c20b916c-27f6-4722-8539-338bb1a05586	page_view	/products	{"path": "/products"}	desktop	Kochi	India	2026-07-14 05:11:04.01
676f89e8-19dc-4395-a05c-b296ed47a7f5	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Kochi	India	2026-07-14 05:11:18.426
894ec830-d2ff-4c9e-a570-fd623a05313a	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Kochi	India	2026-07-14 05:11:18.447
c96f0155-1e20-44d7-b826-94d471ac754c	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Kochi	India	2026-07-14 05:11:18.454
e29d3b06-aaff-4caa-b141-10184a82b0c4	page_view	/products	{"path": "/products"}	desktop	Kochi	India	2026-07-14 05:12:33.459
2770774a-ed2a-4111-880a-cad1e02700e3	page_view	/	{"path": "/"}	desktop	Kochi	India	2026-07-14 05:12:34.518
bbeaf1b2-d72a-4874-9287-5abcff30bbc4	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Cupertino	United States	2026-07-14 06:31:09.136
708202b6-c879-4962-9cb6-085eed4600dd	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Cupertino	United States	2026-07-14 06:31:10.52
e581be11-bece-49b7-addc-1281c06bda9d	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Cupertino	United States	2026-07-14 06:36:44.678
c1f4b835-1026-4c2c-93ff-0aa1d69b5fac	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Cupertino	United States	2026-07-14 06:36:46.069
32d26e66-27a4-44fb-8cbc-aefcb649e3c1	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	Cupertino	United States	2026-07-14 08:32:21.608
d03007ab-fb21-4e7c-9f4b-ba331385e551	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Cupertino	United States	2026-07-14 08:32:23.048
15a11c7c-d94d-421e-854d-54bd821b6121	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-07-14 15:04:55.223
7f8f793d-89e6-41fb-a5ff-209b2ba7bf18	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-07-14 15:05:05.803
7dad546e-7cd0-4629-98f6-0e42a58b2173	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-07-14 15:05:32.053
c4facb50-fb2c-41be-a84a-a0642b288a92	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-07-14 15:05:40.654
a30456e6-70af-4473-8704-c2f2838dcaec	filter_applied	/products	{"value": "Terry Cotton", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:05:44.067
b6e4a791-f1f0-4149-bf48-44d32129b2e4	filter_applied	/products	{"value": "Terry Cotton,Lycra / Stretchable", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:05:46.526
69834cbc-2ed0-40fb-9c40-ed722cba7ade	filter_applied	/products	{"value": "Terry Cotton,Lycra / Stretchable,Polyester", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:05:47.386
e939470a-d0ec-45c5-bde7-7523a825afa1	filter_applied	/products	{"value": "Terry Cotton,Lycra / Stretchable,Polyester,Cotton (100% Cotton)", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:05:48.87
d172ec90-c334-4d95-939b-8f88e14b388f	filter_applied	/products	{"value": "2", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:55.132
047f517a-58ba-4c9e-a331-a8029479001c	filter_applied	/products	{"value": "24", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:55.501
6c673836-d903-4c82-a326-cc7c8dcb5aba	filter_applied	/products	{"value": "240", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:56.147
7c74717a-bb46-44f8-bf4e-cbcfb5ab19cb	filter_applied	/products	{"value": "24", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:56.465
ec338fd8-d4fa-4e4e-8d2a-eacc36ff43ec	filter_applied	/products	{"value": "2", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:56.635
82e886e3-2ad8-4157-8571-5c9e826b8d39	filter_applied	/products	{"value": "20", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:57.304
169cac8e-d8cc-4254-8650-d4ed4aa90b24	filter_applied	/products	{"value": "200", "filterType": "minGsm"}	mobile	Kanpur	India	2026-07-14 15:05:57.433
33fbb7ee-0b25-4d12-93cb-59076a0f841d	filter_applied	/products	{"value": "Terry Cotton,Polyester,Cotton (100% Cotton)", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:06:03.952
e96df762-457f-4c0c-8f2e-8d79fd07863f	filter_applied	/products	{"value": "Terry Cotton,Polyester,Cotton (100% Cotton),Lycra / Stretchable", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:06:04.073
a6076660-716d-408e-b00f-b4b2086b55af	filter_applied	/products	{"value": "Terry Cotton,Polyester,Cotton (100% Cotton),Lycra / Stretchable,Bio-Wash Cotton", "filterType": "fabric"}	mobile	Kanpur	India	2026-07-14 15:06:05.513
48867afe-88b6-4f33-b158-c70e81b3f30b	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-07-14 15:06:08.044
b60cb215-f147-4eff-80d3-d23c3bb3713c	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-07-14 15:06:11.172
50dbe630-d2d8-4c5a-bc32-c26440437a5d	page_view	/	{"path": "/"}	desktop	Agra	India	2026-07-14 15:57:13.864
42cc71f6-9de6-4fa5-b7d9-19afaac43b95	page_view	/products	{"path": "/products"}	desktop	Cupertino	United States	2026-07-15 04:40:23.858
12e092e4-7e79-47a4-8b92-13280bc41862	page_view	/	{"path": "/"}	tablet	Ashburn	United States	2026-07-15 05:17:23.91
79288b0a-e67f-4409-a721-249be480d2c6	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-07-15 05:19:54.804
5f847d4f-801b-4adc-a441-e32508d5c857	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:24:46.234
cfdbc2cd-c6e1-4e8e-9b0e-97c303ecf26c	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Mumbai	India	2026-07-15 05:24:46.23
bc6dc667-4eb4-4013-aa3b-7ca339cb1414	filter_applied	/products	{"value": "Dry-Fit (Sports Polyester)", "filterType": "fabric"}	desktop	Mumbai	India	2026-07-15 05:25:11.092
40b0bcc5-3295-485c-beaa-b71eae297fcc	filter_applied	/products	{"value": "Dry-Fit (Sports Polyester),Polyester", "filterType": "fabric"}	desktop	Mumbai	India	2026-07-15 05:25:17.478
fb78d68a-fa6d-4015-8666-219de9c103b7	filter_applied	/products	{"value": "Polyester", "filterType": "fabric"}	desktop	Mumbai	India	2026-07-15 05:25:19.448
83953806-2d92-455a-8819-f4fe1f289d34	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Mumbai	India	2026-07-15 05:25:25.427
a433ab56-fbd1-4a72-97e8-8f6a2b14c92f	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	Mumbai	India	2026-07-15 05:25:25.436
2270d260-a497-4dae-b178-8555b544817c	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Mumbai	India	2026-07-15 05:26:39.954
bf9b2b13-e9be-4021-85a1-b726fa56f6fe	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Mumbai	India	2026-07-15 05:25:25.466
c21c964d-db4b-4a95-90be-7403ffb78fbd	product_card_click	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:26:39.953
04f4863d-6f0a-4ab1-8e25-0a9f6f8def94	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-23 06:21:59.109
081be030-1108-4204-a36c-f17e7553b670	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-07-24 12:59:24.346
2819b6d2-29f4-4853-91a5-6068322ab736	page_view	/	{"path": "/"}	desktop	Ghaziabad	India	2026-07-25 06:32:57.958
fbbc556b-9926-4290-baa9-05f28a62f6a0	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:12:04.524
94895e32-4e68-4896-ab3d-30e2821f6f4e	product_card_click	/	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-25 15:13:01.06
2a5c5ded-b41b-490a-bff0-0be21f586638	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-07-25 15:13:01.088
44952be9-d510-4af1-bb4a-343fbe8b7d03	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-25 15:13:01.102
079035b6-6a4f-4d73-b10e-ef3a5aa4d8bd	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:13:02.9
0be64367-09e7-49ca-8d5a-87c0e1d61790	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:13:07.547
563945b0-2adf-4204-a06f-c454cc7f9a69	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-25 15:13:11.257
77f3a6ac-c015-441e-b858-3df04c08d7f7	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-07-25 15:13:11.313
a27c33dd-dd64-4796-bfe6-a7e6d4452c7b	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-25 15:13:11.754
911afaba-2a8c-4d42-be17-9a7a979604ae	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:13:48.223
e52dff78-451e-4608-b419-11aa6da0c64e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:13:54.168
b8fd286f-3d1e-4c00-84a8-c17614c2cd73	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:13:55.661
7bb1fc87-57bf-49e5-871c-b49bb6d5c65e	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-25 15:14:07.884
f9d25d80-553c-41ff-ad1b-624af4c5e4b1	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:14:07.91
a52f6cae-ad3c-4be1-9463-e327e2e05771	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-25 15:14:09.75
4d5fb8bf-c22f-42c7-8993-363aace70a84	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:19:52.273
4e774dd4-e92c-460b-806e-a6b67d1caaba	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-25 15:21:06.916
9e7beacc-6a08-405e-a2d5-0518054b9b6c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-25 15:21:07.502
1988bc25-6929-44d8-8f5b-d968334b5dbf	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-25 15:21:15.138
9c842048-94e1-4aef-9631-f4f532e19fd5	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Mountain View	United States	2026-07-26 03:06:59.829
620ea631-8cb8-4034-b687-93ca078c0810	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-07-26 03:07:00.427
1173608e-cccc-481c-b32d-d8c9dd22412a	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-26 06:43:39.477
e95cce0c-78a0-479e-8a03-e8bcdd1e3d81	page_view	/products	{"path": "/products"}	mobile	Dehradun	India	2026-07-26 06:43:46.02
81db6a53-346d-435e-ba49-809f4d9a2ff5	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-26 06:43:47.232
baa863ed-8579-4540-a63c-2f56fbe2eada	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-26 06:45:21.389
d47cc29d-a24e-4236-a3b9-7cceff421dde	page_view	/products	{"path": "/products"}	mobile	Dehradun	India	2026-07-26 06:45:23.172
03a4d080-e443-4d7f-a631-2fe142212774	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-26 06:45:24.603
2b407236-83b8-4540-b8db-50442e19a760	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Mountain View	United States	2026-07-26 08:29:12.216
3326341e-c7e5-47e3-9cfb-b7776b98de07	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-26 08:29:12.803
f4e94fca-3b11-4b16-95fe-385562aaa560	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-07-26 08:31:26.273
95b0f9ce-117e-46e6-b17c-3d6119db82d0	page_view	/	{"path": "/"}	mobile	Indore	India	2026-07-26 14:24:14.744
abbc3d7e-b265-46d3-aefe-c0e0f2ee71e0	page_view	/products	{"path": "/products"}	mobile	Indore	India	2026-07-26 14:24:47.637
5ea02b55-b0a3-48c4-b9f0-be7f39a51953	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Indore	India	2026-07-26 14:24:47.64
306237ae-8332-4e18-a021-c5125a52f21b	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Indore	India	2026-07-26 14:25:04.1
017d9536-a6ed-4728-8b30-814394c1dc3d	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Indore	India	2026-07-26 14:25:04.104
4de04a53-e120-4eca-8b69-5b850801e01a	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Indore	India	2026-07-26 14:25:04.12
8bd280a5-a1db-437f-860b-7dbe6ee047cd	page_view	/products	{"path": "/products"}	mobile	Indore	India	2026-07-26 14:26:14.166
3d60e05e-a449-4730-90a4-e69685ce601a	page_view	/	{"path": "/"}	mobile	Indore	India	2026-07-26 14:26:18.736
3f22bcf9-5591-494c-918d-59c50fe30832	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:26:40.083
0b74f10c-aac3-4626-bb74-5b17d4da8716	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-07-15 05:34:35.052
655324d1-fc85-41e6-a2ca-8cc56012d409	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:34:51.962
952b2845-2202-489e-9e5e-725d047e7fc9	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:34:51.965
effbea82-e624-47de-b2e9-136f0bbf9180	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:35:08.564
417791aa-d464-4063-a3b8-c7264809b7a2	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Mumbai	India	2026-07-15 05:35:08.578
436f8920-cf1d-4415-a8ba-819a85fcc655	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:35:08.608
46416b67-f447-434f-918f-85af74cf31ce	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:35:40.738
4836f640-f167-4671-85d9-2dc1f6335402	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:35:56.682
b5db1213-3b08-4214-81ad-fb96d3cca8d0	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Mumbai	India	2026-07-15 05:35:56.685
50272ca2-35a3-4604-a188-8a7c51c48eca	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:35:56.687
2bd98a94-23a2-4cc5-a3d2-9637c50ad782	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:36:26.903
65d99268-20b7-4b78-83d3-01d7dec1c89f	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:36:29.914
58e97128-3a31-469e-a41c-dc0892c8c070	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Mumbai	India	2026-07-15 05:36:29.979
324b6f7b-c065-4c86-8b41-565fa7fb50d1	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:36:30.018
ff90b8dd-891a-4d9b-b914-84225d021e30	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:40:40.779
0a8a0c1a-a908-4d8e-be20-37ce76ebaebf	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:40:45.794
fa936778-716c-4be5-aea8-237bdc380dab	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Mumbai	India	2026-07-15 05:40:45.795
f459e6a4-d5a7-4581-bfa8-af785aac8fe2	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Mumbai	India	2026-07-15 05:40:45.817
b224bd65-a1cd-41a5-9f24-ad99f45c87fe	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:41:05.415
447e4234-d571-454d-a727-879d035d4bfe	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-07-15 05:41:15.298
846f1ca2-199c-4c10-99bb-144f8f9ce7a6	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:41:19.526
f356cf6f-0e0f-4baa-b2f5-4661da2352b5	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:41:19.562
462ebb2e-4403-4ad7-9a9b-22814680da4e	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Mumbai	India	2026-07-15 05:41:48.924
e5f76ed7-6587-4f65-a45c-ef16fda6309c	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:41:48.925
62abb419-8084-47ef-8561-67d28dd91a6b	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:41:48.939
32a6cd50-62dc-4d49-a35f-9225bba7e81f	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:49:17.49
41a3633b-064d-447e-983e-b3dbfdfb7b41	page_view	/	{"path": "/"}	desktop	Mumbai	India	2026-07-15 05:49:35.722
75f68647-e5ea-420c-9969-8fac56fa2105	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Mumbai	India	2026-07-15 05:49:38.941
173b9f85-60b0-4e21-991e-2c84819b17c3	page_view	/products	{"path": "/products"}	desktop	Mumbai	India	2026-07-15 05:49:39.031
f3bcc654-0a05-470e-a18b-eff275f5abe8	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	desktop	Mumbai	India	2026-07-15 05:49:47.258
b4446b3b-7e97-4687-9eb4-5ef06082e01e	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Mumbai	India	2026-07-15 05:49:47.272
81b2f724-e107-4090-9401-ebbad5a1178c	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Mumbai	India	2026-07-15 05:49:47.259
e6e8639c-2162-4a74-bbf5-72178a54cf0b	product_card_click	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:52:27.61
dad832d4-2f5e-4004-8209-bfb7cfb9366e	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Mumbai	India	2026-07-15 05:52:27.614
88235a23-5821-4b9e-afe6-184ab7a23d93	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:52:27.624
fdf80aaa-4f2a-4e57-aff9-c079ea258513	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Mumbai	India	2026-07-15 05:52:56.921
9789ad05-254f-47f0-883c-fcb4a4f6ebe4	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 13:56:31.488
c050ba98-fc81-4887-bc90-70ff9b2ab228	product_card_click	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:52:56.922
2225f1b7-09ef-4332-ac0b-eaf84397376b	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Mumbai	India	2026-07-15 05:52:56.937
7f9564d8-4617-486a-8621-bbdb26a5db6d	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-07-15 06:48:20.29
cf15814c-a58c-4dab-aa22-1ffb512cff2e	page_view	/	{"path": "/"}	mobile	Ranchi	India	2026-07-16 04:19:24.279
64cc4438-093a-492f-9b00-7bd7e0ad7411	page_view	/products	{"path": "/products"}	mobile	Ranchi	India	2026-07-16 04:19:32.732
9292d283-cdb1-48ef-9a15-9730b68ee0ff	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Ranchi	India	2026-07-16 04:19:53.918
009848e0-5b1c-4a2b-9fcd-b240fd9e82b8	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	Ranchi	India	2026-07-16 04:19:53.947
3372ef48-1660-466e-8b1d-2f0c925f202e	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Ranchi	India	2026-07-16 04:19:53.949
3c482304-28f2-434f-871d-8aa83d11d32e	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Mountain View	United States	2026-07-16 11:34:36.938
59f4daa8-d19f-4d78-afa2-4f637b01cb41	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-16 11:34:37.341
010e4c0d-d311-475f-87b1-a2f69ea4c5dd	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Mountain View	United States	2026-07-16 11:49:38.099
f6af9085-be5d-4b55-9dd2-132f7d6eb1bb	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-16 11:49:38.934
8f892241-2a41-4ea0-a59c-c97b2bc3aa29	page_view	/	{"path": "/"}	mobile	Surat	India	2026-07-16 12:02:25.142
62bfbf59-bccf-49e5-b322-eeea2c8511aa	page_view	/	{"path": "/"}	mobile	Kolkata	India	2026-07-16 15:00:29.903
4f525652-265a-4c8c-80b3-1eed7bfdcc1e	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Kolkata	India	2026-07-16 15:00:48.982
aaf70120-6b07-497c-adea-91bcae3c1264	page_view	/products	{"path": "/products"}	mobile	Kolkata	India	2026-07-16 15:00:49.259
1b2cc887-9a88-46ea-b6c8-4c4c0d7d1e2a	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Kolkata	India	2026-07-16 15:01:11.408
8d821728-c5ae-4cc0-9eaf-d958aa809925	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	Kolkata	India	2026-07-16 15:01:11.518
9f85ce25-e4d8-4ac0-b9ba-d0ebb9ab01c7	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Kolkata	India	2026-07-16 15:01:11.666
eaa087ae-597c-4220-aeff-ba31f55aee2b	page_view	/products	{"path": "/products"}	mobile	Kolkata	India	2026-07-16 15:01:20.116
a11dec66-c1f1-41b1-8298-92d805345de3	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Kolkata	India	2026-07-16 15:01:51.603
0e386b15-4f16-4cab-a815-50064283bac3	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Kolkata	India	2026-07-16 15:01:51.671
bca987d9-ec5e-457a-b5d7-07fc554168fc	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Kolkata	India	2026-07-16 15:01:51.737
a1410df0-236f-43a0-b626-e7611970a6f6	page_view	/products	{"path": "/products"}	mobile	Kolkata	India	2026-07-16 15:02:11.588
d6c4c470-44d8-44db-a2e6-f07f147f62d7	page_view	/	{"path": "/"}	mobile	Kolkata	India	2026-07-16 15:02:12.926
54cef6c1-4f15-4ea2-ac89-15c7398caed8	page_view	/	{"path": "/"}	mobile	Pryor	United States	2026-07-16 17:27:26.27
ab28bbe4-544d-4b69-97a0-0a6b809770f2	page_view	/	{"path": "/"}	desktop	Pryor	United States	2026-07-16 17:27:28.255
4d2bc63e-5beb-4ae7-a0ce-d7434ad94d31	page_view	/	{"path": "/"}	mobile	Panjim	India	2026-07-16 17:55:47.026
c39a1f78-bff3-41bf-be73-8281024f15c8	page_view	/products	{"path": "/products"}	mobile	Panjim	India	2026-07-16 17:55:52.465
3fecec10-c295-4b8d-b93a-a72128e1f511	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Panjim	India	2026-07-16 17:56:27.321
3890c784-c69b-40bf-914a-51e7a6ba3a01	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Panjim	India	2026-07-16 17:56:42.697
0e548590-7370-45ef-89ab-a180b0a70c36	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	Panjim	India	2026-07-16 17:56:54.898
0c8b0a8f-ac33-4b8d-84d0-5b671c1bdcda	page_view	/	{"path": "/"}	mobile	Panjim	India	2026-07-16 17:57:07.218
6e772c69-a48a-4c76-b2c6-1afcfa07ecdc	page_view	/	{"path": "/"}	mobile	Pryor	United States	2026-07-17 01:44:49.221
03aed6a4-ef78-42cc-8726-f2aaf9b90daf	page_view	/	{"path": "/"}	desktop	Pryor	United States	2026-07-17 01:45:11.584
2f30420b-d66c-42ba-a225-ddcac5dd61a4	page_view	/	{"path": "/"}	desktop	Ashburn	United States	2026-07-17 09:31:23.172
0d17ffde-3c2f-4519-8d38-652092ee75d4	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Mountain View	United States	2026-07-17 13:13:54.323
a2b0d13c-ee90-405c-93fa-3b72d015a856	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-07-17 13:13:55.51
51248279-2234-447f-8fdb-16abbb20e1bd	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 13:56:03.739
662daf8f-5bbd-4cb0-8e52-f06379d99d40	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 13:56:19.851
846585ea-32ff-438d-bbf2-4ef9c2c4b6c3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 13:56:19.871
888212e5-9342-4e37-a950-6d8f1dbb624c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 13:56:28.591
1e70eb40-411b-48d1-84c8-51f9c7fc2529	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 13:56:31.601
3d10bb02-58f1-4c5d-ae71-2194c535e13f	filter_applied	/products	{"value": "Bio-Wash Cotton", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:33.322
afe58268-77a0-4aab-a7da-527494d00a15	filter_applied	/products	{"value": "Bio-Wash Cotton,Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:35.569
68d3a7a4-9e32-428b-a412-5c315086ef5a	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:36.529
f32eec0d-892d-46a1-8936-199a4a92402a	filter_applied	/products	{"value": "Cotton (100% Cotton),Cotton Blend (Poly-Cotton)", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:37.111
8138c534-f09d-480b-8d85-976c7e4d3dd6	filter_applied	/products	{"value": "Cotton (100% Cotton),Cotton Blend (Poly-Cotton),Dry-Fit (Sports Polyester)", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:38.418
e12f0b67-5986-451a-8997-d920a60d8e5b	filter_applied	/products	{"value": "Cotton (100% Cotton),Cotton Blend (Poly-Cotton),Dry-Fit (Sports Polyester),Lycra / Stretchable", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:38.949
e7d00aa3-d174-42bb-906d-8d3cee7553a8	filter_applied	/products	{"value": "Cotton (100% Cotton),Cotton Blend (Poly-Cotton),Dry-Fit (Sports Polyester),Lycra / Stretchable,Polyester", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:39.578
88e3b622-7bb0-495d-a88b-2d6a6a224909	filter_applied	/products	{"value": "Cotton (100% Cotton),Cotton Blend (Poly-Cotton),Dry-Fit (Sports Polyester),Lycra / Stretchable,Polyester,Terry Cotton", "filterType": "fabric"}	desktop	Noida	India	2026-07-17 13:56:40.233
b21d9431-a7c0-42b0-bdd6-7d5008b49a67	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 13:56:42.153
737ae676-7914-415c-870a-9a1cc6cce1ef	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-17 13:56:47.554
d810e532-45b3-473c-9028-a84bc9d40943	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 13:56:47.581
f1d744fd-17e7-43e5-a9aa-ed905a2e543e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 13:56:53.904
bce9ffea-ad61-4d9a-ba33-cad23f98f8df	whatsapp_click	/	{"source": "hero"}	desktop	Noida	India	2026-07-17 13:58:29.022
9e94084b-e025-48b1-b695-506bfcaa7cf3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 13:58:50.776
0ad942d4-2de4-45f3-b168-923c5d90da88	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 13:59:07.518
9b9c13ad-e76c-4abc-85db-259dafa46136	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Noida	India	2026-07-17 13:59:56.517
aaa036c1-3bd2-4ec4-a046-f138a27e4fc6	product_card_click	/	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-17 14:00:38.394
cecd5167-924d-430e-8a79-5532535525b9	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-17 14:00:38.427
a26f0b83-232c-4d16-9577-7e06396242f5	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-07-17 14:00:38.431
60c3b2f2-2fdc-4f36-ac1f-3e71ac3c5dfd	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:00:53.788
286dcf1e-4541-4626-9b1f-d3b81dd4ba0a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:01:12.037
754249a9-9231-4caf-8f09-b320aad4fc3b	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 14:01:13.843
f09bfccf-840b-4466-9c93-2829b1e7ba2c	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 14:01:13.927
23f4de8e-f77d-453b-bdc6-c5c1c964833d	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-07-17 14:01:13.936
044486c6-916d-45c5-bac2-752562fe5941	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:01:19.137
1902729e-e36d-4f4a-8d87-234b62ee994b	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-07-17 14:01:21.127
d0e72fb0-e401-4b97-9358-46f090c9246d	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 14:01:21.218
8d85e489-f091-423c-b70b-ae50e5c038b1	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:01:21.749
f3971116-73e0-4f5f-9024-3f3f59097704	page_view	/products	{"path": "/products"}	desktop	Pune	India	2026-07-17 14:01:24.066
793085ea-a2e7-437c-87ec-a0fd6232fe0c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:06:42.053
b50d7a47-cba2-448c-a59e-48bf9d716dbd	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-17 14:06:42.058
b4f01a45-91ce-487f-92e1-3befe3016b75	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-17 14:06:43.095
074d730e-84ae-4a9a-b5bb-264d83aeb0fb	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-07-17 14:06:43.106
ec310243-4b25-45e9-88fa-32e0782d7efa	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-17 14:06:43.215
8fad3904-6666-45a9-8a24-c7ffc3188da8	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:07:37.931
73315712-42b1-4f34-b39b-698fd4297cc4	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-07-17 14:07:44.838
103081ef-0f0a-425e-b234-91d4a7a7cfa4	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:07:44.84
2e3ca1cd-8755-418c-9997-34dc6872c451	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:07:47.869
e0fd7e5e-9fa7-45cd-a789-7e9eac13776d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:15:36.999
7c7c2b13-60d1-4f4f-acdd-eefc64fecc1d	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:21:06.108
59e876e3-ff67-429d-b86f-9f2fcedd2d61	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:21:11.733
05081c8a-946d-4001-93ed-eaa3af7b22d3	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:21:37.651
91d7366b-d4a5-4048-9470-aeb98aa33c49	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:24:37.495
81bb272b-5838-41ee-968e-a78d2bec8119	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-07-17 14:24:46.103
7bed8f6f-b04a-4ec4-9dba-a7922713eced	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:24:46.153
b27a0cab-9bed-402a-bf40-0d27a0414205	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:24:47.662
189d0dee-9f6f-49a9-8df5-42441e1e7133	product_card_click	/	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 14:27:49.759
82dcfb37-bd59-4dff-932f-bd382d45a614	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-07-17 14:27:49.769
a397f1ce-b3e9-4133-a752-f15a2fcfa465	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-17 14:27:49.804
98d9d98c-4678-4c8e-b49c-3b6d24484815	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:28:07.336
7659b5c0-6206-439a-90ae-eb3f0afed8b0	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-17 14:32:31.57
f63bb71f-986b-4fac-b803-50abe51aacbb	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 14:32:33.299
99ed3465-fe4f-4398-88cd-a803c4fba976	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 15:24:17.922
5e195778-1eb9-4725-a930-344e3a0fe2a5	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 15:46:05.494
0e0841bc-5c10-4a65-953f-a6d63311b2ef	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 15:47:15.546
1ad63b3e-586c-44dd-be5b-768d1c76ab76	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 15:56:16.17
c8ed79e4-4be1-4ea7-8b62-63a425a01205	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 15:56:37.738
bc4524eb-4d3d-4943-a528-7a19ea25203d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-17 16:00:26.746
e49666ff-04af-4f83-8a7b-64cd8d3a9027	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Mountain View	United States	2026-07-17 19:11:16.955
c16609bb-38f4-4dda-9ba0-ec82bade22c0	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-17 19:11:17.424
a30573ca-3e96-4005-8021-d245f4cabab5	page_view	/products	{"path": "/products"}	mobile	Pryor	United States	2026-07-17 20:06:59.55
e5b7c77a-d44d-4c59-a234-5c156518dca4	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-07-18 07:04:56.097
3a3a0957-98a6-42f4-a0f8-16a839ee72d0	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-07-18 07:05:08.833
2a0ae264-3a61-4bec-85a1-aa49c39c4bfe	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Mountain View	United States	2026-07-18 15:51:40.467
277cb160-bc52-4512-ac9b-9c6d07428a81	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-07-18 15:51:40.793
18d2ac53-693d-44a2-95f9-55f9d74c8ae4	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Bur Dubai	United Arab Emirates	2026-07-18 23:41:39.824
95a632cb-f222-4062-9677-ad52d87b1a8d	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Bur Dubai	United Arab Emirates	2026-07-18 23:41:39.824
bc3479c5-4f5b-4dd6-920b-f97bca1ff496	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Kabul	Afghanistan	2026-07-18 23:41:40.808
d55c439f-f591-4bbd-a391-38540b9ec447	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Kabul	Afghanistan	2026-07-18 23:41:41.171
4bb13001-d592-4199-a47d-1bf008f949b8	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Kabul	Afghanistan	2026-07-18 23:41:41.695
8a0ee567-d57d-4bee-a422-b5315abfab29	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Kabul	Afghanistan	2026-07-18 23:41:41.816
eda6dea1-e216-4722-8be4-82a09d695392	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Kabul	Afghanistan	2026-07-18 23:41:52.624
b4f9acf9-c9b8-4339-9cee-cebe32a64934	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Kabul	Afghanistan	2026-07-18 23:41:53.196
642b582d-25f1-4fcc-91bc-34a93f531bc9	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Bur Dubai	United Arab Emirates	2026-07-18 23:41:54.265
02a097ec-6e72-4cda-9bd8-0b8e4cc7ae33	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Bur Dubai	United Arab Emirates	2026-07-18 23:41:55.038
91b120c1-8b2b-4840-9fcd-4ebecc0eae34	page_view	/	{"path": "/"}	mobile	Kollam	India	2026-07-19 03:41:02.575
7eaa7cc5-69d1-4506-af0f-83651d8669f9	page_view	/products	{"path": "/products"}	mobile	Kollam	India	2026-07-19 03:41:04.293
42f0a905-5eac-4d11-b52a-b5d6307e10fe	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Kollam	India	2026-07-19 03:41:18.912
ee12529a-72db-45d4-bdb2-6f2b89750c9f	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	mobile	Kollam	India	2026-07-19 03:41:32.726
92ce6a82-8b2b-4cd2-b266-d2e5f0e77426	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	mobile	Kollam	India	2026-07-19 03:41:32.77
2a462593-3139-4992-815a-adda8a9089fb	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	mobile	Kollam	India	2026-07-19 03:41:32.788
90088054-8a38-423b-9c4f-8fe6c3bde19f	whatsapp_click	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"total": 14000, "source": "product_page", "quantity": 50, "productName": "Polo Sports", "pricePerUnit": 280}	mobile	Kollam	India	2026-07-19 03:41:36.044
f13d5a25-4dd3-4a58-a757-f106f5fa46d6	product_card_click	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Kollam	India	2026-07-19 03:42:00.791
ae47c56f-7095-40e8-93c2-9d8b6aaa522e	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Kollam	India	2026-07-19 03:42:00.812
3d0f57e9-0384-4de9-bc90-ad27de792c8b	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Kollam	India	2026-07-19 03:42:00.834
4a7b4203-a14d-44a2-9a6b-788061380f2a	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	mobile	Kollam	India	2026-07-19 03:42:25.695
def8696f-c122-4c20-8f1f-1e19b7d33e08	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	mobile	Kollam	India	2026-07-19 03:42:25.722
74a1f12d-6d25-42bb-91ba-f70a93f7a1f6	page_view	/products	{"path": "/products"}	mobile	Kollam	India	2026-07-19 03:42:26.333
7be25ce9-a269-41e4-8f50-ec3aecce77b1	page_view	/	{"path": "/"}	mobile	Kollam	India	2026-07-19 03:42:27.031
b6da91e5-bace-48b4-88c9-6244900565a4	page_view	/	{"path": "/"}	mobile	Kollam	India	2026-07-19 03:42:34.86
68464205-f233-44b0-a093-74b3fd3db778	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-19 16:02:54.402
4edebbfc-c25a-4c6e-92f7-d57caa7afde7	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-19 16:02:59.737
d3eb2e99-d5af-41f5-ae87-357b5e72c8c7	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	Guwahati	India	2026-07-19 16:03:04.877
d8cb5321-184c-4fdf-8509-124fc2718bfa	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	Guwahati	India	2026-07-19 16:03:19.322
d44edf5d-2c60-4ef3-9e40-6e358b44cd22	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	Guwahati	India	2026-07-19 16:03:19.412
06b90d14-4547-46c6-af7a-6d4fb94973b2	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	mobile	Guwahati	India	2026-07-19 16:03:19.569
566444ea-6fe2-4f5b-84bc-8f110d35f8a3	whatsapp_click	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"source": "navbar_whatsapp_drawer"}	mobile	Guwahati	India	2026-07-19 16:04:37.302
4b684e35-8931-41b8-bb10-f7a9e3c06103	whatsapp_click	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"total": 13200, "source": "product_page", "quantity": 60, "productName": "PC MATTI 220 GSM", "pricePerUnit": 220}	mobile	Guwahati	India	2026-07-19 16:04:45.761
cdefb27b-68b6-4840-8dd3-195c4c4c7deb	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-19 16:04:51.035
c42825c4-3970-4f10-8b1f-53975a2eb27e	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Guwahati	India	2026-07-19 16:04:54.528
7d891d5c-85a9-41f2-a61a-a3d329faf9bc	whatsapp_click	/products	{"source": "footer_strip"}	mobile	Guwahati	India	2026-07-19 16:05:29.134
78580ede-84ce-4108-b760-fb5cc634522e	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-19 16:05:33.106
92eb95c8-dff6-4e53-8885-e18a2bd5b099	page_view	/	{"path": "/"}	mobile	Haldwani	India	2026-07-19 22:39:18.077
a9bfb405-079a-425d-b5fe-37797b61f669	page_view	/products	{"path": "/products"}	mobile	Haldwani	India	2026-07-19 22:39:18.574
e2ccfebd-7915-4157-9dc6-34e40fd721d6	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Haldwani	India	2026-07-19 22:39:59.964
06dc965f-b2e5-4a48-a6dc-3ec7be2c7e1b	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Haldwani	India	2026-07-19 22:40:33.092
a75b34eb-506f-4384-854f-762a770fd527	page_view	/	{"path": "/"}	mobile	Haldwani	India	2026-07-19 22:40:43.287
dd46f5f4-65f5-44b2-a731-cf3edea09c59	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Mountain View	United States	2026-07-20 02:27:31.33
730609df-b147-4013-ad2a-e5df3bae3aff	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-07-20 02:27:31.949
7f6abd6e-92ed-43d3-89cb-5222dbdcdd4c	page_view	/	{"path": "/"}	mobile	Tanuku	India	2026-07-20 07:55:18.747
6c20bc1a-5faf-4edc-b9f0-ab5c0f6832df	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-07-20 14:59:23.026
eebdf913-03d4-4e93-b6af-390abc1420d9	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	Delhi	India	2026-07-20 14:59:27.017
1c7d1c2c-2bd3-446c-8804-6c98890b3a46	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-07-20 14:59:27.238
a6c02856-a12f-40f7-9992-bb565b1b3442	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Delhi	India	2026-07-20 14:59:33.592
eb285202-f54f-4cb4-85b2-79767594cb8a	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	mobile	Delhi	India	2026-07-20 14:59:33.596
81c5cda4-7866-449a-b2a4-c68af9020982	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Delhi	India	2026-07-20 14:59:33.726
0dfc8cc0-37a1-4cef-9d52-aa5357a238eb	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-07-20 15:00:23.242
72ca04de-9903-4615-a3fc-e6eff720e263	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-07-20 15:00:30.134
a0d1e75b-d715-41f7-896e-868f75d2a162	page_view	/	{"path": "/"}	mobile	Murshidābād	India	2026-07-20 19:31:23.625
e0c8b7fe-6c48-48fd-894c-549615854ef4	page_view	/products	{"path": "/products"}	mobile	Murshidābād	India	2026-07-20 19:31:27.794
4ff625d4-ebde-4850-9518-cc56b44fa9ab	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Murshidābād	India	2026-07-20 19:31:40.631
382277ec-7fdb-46ad-a96a-9c11e90f0029	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	Murshidābād	India	2026-07-20 19:31:40.663
37e61f0e-e57f-416d-b348-149b8f7b32be	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Murshidābād	India	2026-07-20 19:31:40.665
dd669cc1-f460-468c-84f4-9ead629b87b0	page_view	/products	{"path": "/products"}	mobile	Murshidābād	India	2026-07-20 19:32:09.576
11da457d-b7e9-4894-9c4c-c5ac8bb1de74	product_card_click	/products	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Murshidābād	India	2026-07-20 19:32:16.298
b7437df2-a181-411b-9c47-7fd603cdc4c5	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Murshidābād	India	2026-07-20 19:32:16.321
450ba157-d49a-4a8c-a649-e1d0e4aa4010	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Murshidābād	India	2026-07-20 19:32:16.326
fafddd09-54fb-40c6-99e1-3f25f8126034	page_view	/products	{"path": "/products"}	mobile	Murshidābād	India	2026-07-20 19:32:26.929
c5e07827-6b81-4bc3-b67a-303b1dbd1d54	page_view	/	{"path": "/"}	mobile	Murshidābād	India	2026-07-20 19:32:27.772
6aa03691-e950-42f3-8cf1-56b2583829ee	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-07-21 14:42:16.292
7fcf6239-9e0b-4c3e-aa30-8c368c4177b4	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:42:44.825
4020cb34-4b09-4417-abda-e93fdd16c832	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:42:44.842
a9ea5760-5e4c-497d-899c-c481ebcc270b	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	mobile	Bengaluru	India	2026-07-21 14:43:03.377
ebf50d4b-e9e1-467d-bf9c-4fac29bbb9bd	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:43:03.378
6f8294a7-f8cf-4db0-b6af-34f96ac85c7c	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:43:03.382
a7c52062-6cdb-45c6-b26f-7d37860d6b54	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:43:09.699
4b1e70e1-632d-45b5-9ec8-18ac6d3216ed	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:43:16.725
fc279676-5d2c-45df-8070-1131a1d38510	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	mobile	Bengaluru	India	2026-07-21 14:43:16.754
19395513-510d-4bf9-8963-f03fd053717a	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:43:16.779
0d1e06b9-b1fd-488f-8bcf-f7f819d43afe	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:43:26.583
f84612cd-1433-4d58-84dd-1b343d408456	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:43:33.619
25cff947-05db-45b4-8e3d-306d3c4f83b3	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:43:33.627
f2e6ff75-3b35-487f-bf71-c63b9961cbed	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Bengaluru	India	2026-07-21 14:43:33.627
cddc2866-5f79-49de-8d15-ef3bf119cbb4	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:43:49.862
66c7b5d3-b959-45e4-b61a-6ef5d2dbf0d8	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:44:13.094
c71ff492-bbce-4602-bd2a-e56d15f22996	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	mobile	Bengaluru	India	2026-07-21 14:44:13.095
4f949536-bf08-4465-a78f-a37e564107da	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:44:13.096
fb737942-6d04-4f80-a99c-f30bb1337e26	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:44:21.798
e926e5e0-3377-4250-aa0d-e7ae0ac2b139	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:44:33.062
d87d40a1-4059-426e-becc-b438fb7b2efa	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	mobile	Bengaluru	India	2026-07-21 14:44:33.063
a8b490f0-7658-465f-824f-a04a77b995e4	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:44:33.075
6732ba29-bbfd-47f3-8507-6e0ec4cf285d	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:44:52.002
a35ba68c-c77f-4729-8a23-e3e8747034e5	whatsapp_click	/products	{"source": "footer_whatsapp_block"}	mobile	Bengaluru	India	2026-07-21 14:45:32.333
fd63d803-7f21-4623-98ea-4a242c59d728	whatsapp_click	/products	{"source": "footer_whatsapp_block"}	mobile	Bengaluru	India	2026-07-21 14:45:37.845
d430bf75-ccfb-4a42-b140-7ec59177577c	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Bengaluru	India	2026-07-21 14:46:10.092
2859ff39-fc09-4dec-9784-358aa6e0ac7d	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:46:55.838
ea5ed232-9564-42c1-8440-a78ebfb7d32f	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-21 14:46:55.89
d7ad2db0-ac3d-4940-8169-2fc6954930e2	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-21 14:46:55.902
701dd0d4-b574-4dc3-aa37-ddb4c9920d50	whatsapp_click	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"total": 10500, "source": "product_page", "quantity": 50, "productName": "Cotton Terry 210 GSM", "pricePerUnit": 210}	mobile	Bengaluru	India	2026-07-21 14:47:16.264
b56ec11c-19a0-4b4c-97d6-0677ea36811b	phone_click	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"source": "product_page"}	mobile	Bengaluru	India	2026-07-21 14:48:45.284
d2658f15-5425-4ca1-809c-7124914c1ecd	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 14:57:02.023
3807137c-98fc-4a9d-95b0-b955a327cf57	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-07-21 14:57:02.099
9aa81500-99df-40e1-812e-22c9986401f4	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-21 23:36:45.083
f380ac45-7ba4-44cb-b996-b9010a641cdf	page_view	/	{"path": "/"}	mobile	Pryor	United States	2026-07-22 10:14:55.939
b2911beb-35a0-45f8-9adc-7a813c961ba9	page_view	/	{"path": "/"}	mobile	Pryor	United States	2026-07-22 11:29:39.833
69b0a673-7e1e-47ea-b3fd-2f6c0e1dd951	page_view	/	{"path": "/"}	desktop	Los Angeles	United States	2026-07-22 17:48:09.375
5c76957c-ca4b-4002-afa3-93c93bc97949	page_view	/	{"path": "/"}	mobile	Pune	India	2026-07-22 20:00:09.253
2d6f1a02-8895-4638-94fa-ef8de2d86676	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-07-22 20:00:14.691
ff36dd09-39e3-44e7-9aa2-6c01633f22c5	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Pune	India	2026-07-22 20:00:23.573
9e82536b-eb90-4a8b-ab92-bdb81114d929	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Pune	India	2026-07-22 20:00:23.575
82a6db12-5c0e-4a00-a2d4-758c1989b795	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Pune	India	2026-07-22 20:00:23.648
60b6f3e6-2344-4368-bdaf-ca792bae3357	page_view	/products	{"path": "/products"}	mobile	Pune	India	2026-07-22 20:00:26.648
2dfbc2ef-a54d-479f-880a-3a7401540d11	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Pune	India	2026-07-22 20:00:47.252
9f5d4285-28f1-48e0-926c-f076d3e81321	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-23 03:28:30.445
990f7a34-113f-4c25-8898-06b26c565cc6	whatsapp_click	/	{"source": "hero"}	mobile	Dehradun	India	2026-07-23 03:28:40.441
0fbd7e87-c0aa-4963-8e83-b8cda6ca55d4	whatsapp_click	/	{"source": "navbar_whatsapp_drawer"}	mobile	Dehradun	India	2026-07-23 03:29:31.646
5aaa0cb7-aea3-4fdc-a6d6-965a77b97c98	product_card_click	/	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Dehradun	India	2026-07-23 03:29:59.682
35aa5a30-3514-4aa3-a8aa-5a3e0cdfbe68	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Dehradun	India	2026-07-23 03:29:59.682
23b82b6f-96d9-4527-a86f-f9be03d7062c	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Dehradun	India	2026-07-23 03:29:59.785
b053e86e-d1fe-40c9-85dd-4db9fe9a7a67	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-07-23 03:30:07.992
28ba3ac1-d31f-4f23-a614-71f37a01f98f	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-23 06:21:59.134
33bd3eb9-4b38-47b1-b09d-793ada26d772	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-23 06:26:19.05
6efc8720-4be0-4c63-9c06-1f6a2c533524	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-23 06:26:19.107
3ac692ba-3fad-40c9-9b6e-9a2c7ba7be0e	page_view	/	{"path": "/"}	mobile	Indore	India	2026-07-24 16:36:47.765
8b1d5996-c20c-4258-96c4-92eb6faec98a	page_view	/products	{"path": "/products"}	mobile	Indore	India	2026-07-24 16:36:49.396
c3e8a8a1-d6f3-44b1-81d5-15537cce34dd	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Indore	India	2026-07-24 16:36:59.386
4905171d-235a-4fcc-b562-cdc1af9dd711	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:37:21.972
a57897d2-d4a7-4956-95bb-00469a193aaf	filter_applied	/products	{"value": "Cotton (100% Cotton),Lycra / Stretchable", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:37:25.401
6f0999af-6047-4531-8643-0bfc2becb07d	filter_applied	/products	{"value": "Cotton (100% Cotton),Lycra / Stretchable,Bio-Wash Cotton", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:37:30.258
0bf4303b-5abc-41bf-9ced-4f05c25ef3fb	filter_applied	/products	{"value": "2", "filterType": "minGsm"}	mobile	Indore	India	2026-07-24 16:37:34.825
c0fd9d0a-6c87-4803-a883-6c8a162d9443	filter_applied	/products	{"value": "20", "filterType": "minGsm"}	mobile	Indore	India	2026-07-24 16:37:35.234
13965519-b157-462b-af53-1af409a8d218	filter_applied	/products	{"value": "200", "filterType": "minGsm"}	mobile	Indore	India	2026-07-24 16:37:35.38
c405c6d0-e9a7-4a98-92df-14acb37a7666	filter_applied	/products	{"value": "2", "filterType": "maxGsm"}	mobile	Indore	India	2026-07-24 16:37:37.44
6e33548f-ddbc-447e-882d-16b5e25c2397	filter_applied	/products	{"value": "26", "filterType": "maxGsm"}	mobile	Indore	India	2026-07-24 16:37:37.781
8ba7613e-ef2f-4c1f-9bd9-53c87093dae7	filter_applied	/products	{"value": "260", "filterType": "maxGsm"}	mobile	Indore	India	2026-07-24 16:37:38.056
a25fcafd-7e64-4a2c-b826-f05a59a37cc2	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	mobile	Indore	India	2026-07-24 16:38:19.868
0dbf2de0-5b21-4be9-a5dc-f3ba98519173	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	mobile	Indore	India	2026-07-24 16:38:19.911
0c2f4824-b8c8-42f7-9b2f-d9542d5c5f9f	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	mobile	Indore	India	2026-07-24 16:38:19.934
02e7e788-aafc-48c2-8b87-e8405f201212	page_view	/products	{"path": "/products"}	mobile	Indore	India	2026-07-24 16:38:26.566
ea8d5ec2-9904-459e-8432-8199b1743c6b	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:38:45.662
fb1f127f-77ae-4709-b827-95b298bbff74	filter_applied	/products	{"value": "Cotton (100% Cotton),Bio-Wash Cotton", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:38:46.255
fe8a688f-ad2c-47f4-948b-4b615c014bba	filter_applied	/products	{"value": "Cotton (100% Cotton),Bio-Wash Cotton,Lycra / Stretchable", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:38:47.089
f774009f-5858-4814-8d76-50b334e83871	filter_applied	/products	{"value": "Cotton (100% Cotton),Bio-Wash Cotton,Lycra / Stretchable,Cotton Blend (Poly-Cotton)", "filterType": "fabric"}	mobile	Indore	India	2026-07-24 16:38:55.379
790b4587-ff41-4019-a52e-a2fc7437eb59	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Indore	India	2026-07-26 14:26:21.149
d438d389-95c8-41cc-a851-d924b443895e	page_view	/products	{"path": "/products"}	mobile	Indore	India	2026-07-26 14:26:21.207
1d48dcce-dab8-4421-bca9-a0ceae30b3af	page_view	/	{"path": "/"}	mobile	Indore	India	2026-07-26 14:26:24.44
c9558357-6ad2-47a8-b682-1f1b7506468b	page_view	/products	{"path": "/products"}	mobile	Indore	India	2026-07-26 14:26:29.895
9833391c-609b-4269-8212-d4d61e8dfd96	page_view	/	{"path": "/"}	mobile	Indore	India	2026-07-26 14:26:35.784
76443ecb-3500-4e20-afae-d2be2f66cecb	page_view	/	{"path": "/"}	mobile	Sanquelim	India	2026-07-26 14:58:56.055
905ed376-e8f5-41e4-a52a-af4f1bc1b99d	page_view	/products	{"path": "/products"}	mobile	Sanquelim	India	2026-07-26 14:59:04.457
03a43ecc-3f60-466b-98f6-780eb1aa2fb8	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Sanquelim	India	2026-07-26 15:01:01.365
7b34e67a-1665-4df4-b701-eca79a6ccad2	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	Sanquelim	India	2026-07-26 15:02:21.128
86278782-9bf1-4fca-856e-bfbc2f12a780	page_view	/	{"path": "/"}	mobile	Sanquelim	India	2026-07-26 15:03:58.559
ade89847-94f8-4d83-9da2-4bb6de98a4f9	page_view	/products	{"path": "/products"}	mobile	Sanquelim	India	2026-07-26 15:04:10.273
41546b18-dbf9-47c2-959c-c9fb9361107e	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Sanquelim	India	2026-07-26 15:04:21.522
999cabe4-8c20-40b3-b41d-cd42c69840c0	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Sanquelim	India	2026-07-26 15:04:21.551
d1eeb55d-6993-4afa-ad5b-a2c92cd2187b	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Sanquelim	India	2026-07-26 15:04:21.587
419aa265-6e82-4f65-b271-e183467fe998	page_view	/	{"path": "/"}	mobile	Bhopal	India	2026-07-26 15:50:03.98
4e8f0f7c-f894-4051-933b-ceedc511ce4d	page_view	/products	{"path": "/products"}	mobile	Bhopal	India	2026-07-26 15:50:04.027
ef1ee676-4ff5-4569-a52a-e6df0dcb1ff4	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Bhopal	India	2026-07-26 15:50:47.114
2366fd07-e2fb-4f20-9234-d507ddbfb621	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	Bhopal	India	2026-07-26 15:50:51.914
9d26331d-845c-41c3-ad98-7de40601e6bf	page_view	/	{"path": "/"}	mobile	Bhopal	India	2026-07-26 15:50:54.729
b56a1203-0f8d-4f36-ab1b-5f865ef24945	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Mountain View	United States	2026-07-27 03:38:33.972
6e8c2699-46a9-4d55-a0c1-ba807c332a03	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-07-27 03:38:34.777
bd2d6500-75a4-44b9-9f04-9b3d68d90f83	page_view	/	{"path": "/"}	mobile	Thrissur	India	2026-07-27 04:40:35.111
3b0ea247-340a-4847-b612-a568227cec54	page_view	/products	{"path": "/products"}	mobile	Thrissur	India	2026-07-27 04:40:48.127
59acb0e5-42e1-476c-9b0d-8c2bdb988f0e	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Thrissur	India	2026-07-27 04:41:03.89
7ffa1df5-f9e9-4a20-804e-4f69a6f36ffb	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Thrissur	India	2026-07-27 04:41:03.984
170dc851-8397-4609-b6df-ca443c347fbc	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Thrissur	India	2026-07-27 04:41:03.985
ca531d12-a0a4-4e6e-87bf-669c410d3250	page_view	/products	{"path": "/products"}	mobile	Thrissur	India	2026-07-27 04:41:06.591
f5916530-57b7-45cf-b85e-049a818aa2c7	page_view	/	{"path": "/"}	mobile	Thrissur	India	2026-07-27 04:41:13.566
16590edd-ec05-4119-8e23-a60f0fc6c7c5	page_view	/	{"path": "/"}	mobile	Pratāpgarh	India	2026-07-27 05:08:59.646
cef14179-6396-4f1b-b11f-5ed0e7399145	page_view	/products	{"path": "/products"}	mobile	Pratāpgarh	India	2026-07-27 05:09:04.06
39d69c4c-cf02-49f7-8136-523fbd25e3e7	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Pratāpgarh	India	2026-07-27 05:09:18.211
dc288cc0-d89d-40ed-b1dc-c97545b03e91	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Pratāpgarh	India	2026-07-27 05:09:18.212
13a51ab9-6d1f-4223-85d2-942643e8b021	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Pratāpgarh	India	2026-07-27 05:09:18.213
453a709c-5d69-4c15-9b73-933487b66028	page_view	/products	{"path": "/products"}	mobile	Pratāpgarh	India	2026-07-27 05:09:31.984
183a41e7-146e-43e8-86d4-777b49096221	page_view	/	{"path": "/"}	desktop	Jaipur	India	2026-07-27 07:50:41.022
089a1f9f-c361-4337-a3d9-0672afa2c67d	page_view	/products	{"path": "/products"}	desktop	Jaipur	India	2026-07-27 07:50:52.96
ace80516-79c4-4ee3-9ebd-b804947da736	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Jaipur	India	2026-07-27 07:51:01.8
79c2190b-12cb-4b61-a164-5971820474e6	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Jaipur	India	2026-07-27 07:51:01.823
cf122232-b267-4033-8876-a6a774d01d5f	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Jaipur	India	2026-07-27 07:51:01.808
ecd0f59b-ea26-499e-a995-3384f731df22	page_view	/	{"path": "/"}	mobile	Ahmedabad	India	2026-07-27 09:02:43.167
e520246d-830f-4211-a7b3-8f8072b4037b	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Ahmedabad	India	2026-07-27 09:02:47.63
5ba81f1a-7ffa-45f6-a62b-9aea568d9a26	page_view	/products	{"path": "/products"}	mobile	Ahmedabad	India	2026-07-27 09:02:47.65
1c5d768a-0f2c-4d60-a8a4-ab6058e64c79	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-07-27 10:56:55.93
030adc99-5235-49a1-abe3-fbb16a49f9fb	page_view	/	{"path": "/"}	mobile	Pune	India	2026-07-27 17:49:44.737
e64867f3-b837-480f-9025-a8b00426fab7	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-27 19:26:57.686
c1811d66-e433-4fac-bc1b-af9080c5cdd5	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-27 19:26:57.718
d872fd29-ebdf-42a1-8f29-2dcd9e8342c4	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Mountain View	United States	2026-07-28 11:56:24.025
80392d74-7647-4a21-a923-5e24ce6cf80f	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-07-28 11:56:24.734
b39e4f3a-ceb9-4203-bc69-1b7dbea0f4ad	page_view	/	{"path": "/"}	mobile	Forest City	United States	2026-07-28 12:38:45.86
c3458b6e-5df2-4f82-a6ff-a1599a2fc303	page_view	/	{"path": "/"}	desktop	Forest City	United States	2026-07-28 12:38:46.945
fe666d8a-d836-483e-89da-dd7fee59760f	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-28 14:18:27.278
ae569ddd-3158-461d-9237-2f781d18526a	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-28 14:18:27.321
a0406be0-07ea-4a27-8920-a4116e770566	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-28 15:31:03.819
ecaf3e99-fa50-453f-9ee6-b8a4dd6af470	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:31:26.691
eb3c6ac2-7e87-4011-9803-85192f863119	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-28 15:31:29.471
4b5861b1-90f9-4cf4-8090-e43d7da55230	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:31:30.475
050b4d3f-477b-4f37-8e59-63291008ab91	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:32:13.292
e05d3afd-cff4-4b6d-b892-cead33ae0daa	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-07-28 15:32:13.297
da917e7d-d4bc-4dc8-b79f-b9c7debe8409	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:32:13.299
923587f5-bbcc-48d4-908a-e7ea37218746	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:32:16.265
70454b90-5db0-4cb2-803f-d848ecaf096d	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-07-28 15:32:19.385
4513a471-fe07-4beb-9a35-b5547425743d	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-07-28 15:32:19.454
650591ef-73a9-459e-83fd-d8e593d28750	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-07-28 15:32:19.454
c1158f53-e846-4b56-b1ac-8f9e375eec8e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:32:21.149
61435b2e-199b-416a-8031-865cf7004aa4	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:33:31.158
ee83ea5d-623d-4cb7-908d-144b72c2559c	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:33:32.315
97586307-624b-420b-9449-450898dfe3fd	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:33:33.238
c129e636-d46c-40aa-932a-ed45c355d1bd	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:33:34.167
d58dd395-6cd8-4c24-95d6-ac7f0fa3c99f	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:33:35.042
9b01dd56-b2a4-40cb-9786-d7de789b9f57	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:33:36.322
1494d59b-f0a5-4cf8-96e5-e6b89a027ae1	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:33:40.832
2cd30067-75ea-46b4-a57d-8812105c86db	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:33:41.721
ffe5efd4-e285-4e5e-adc3-2bcca3c9a09c	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:33:44.27
148b6a90-9584-4ae8-ae07-b8e0e766e115	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:33:45.411
679187f0-66c9-45f6-9a3e-3158762f5159	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:33:48.727
315d5c0d-4744-49df-b6e4-836823ade031	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:33:49.755
28c3e854-110b-4b48-a066-52a2bb4ab4f8	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:33:50.672
91ab3f42-d4f2-40bd-b12a-cbc837231c61	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:33:51.402
1b93224f-5a6b-43dc-b5b0-80924a1f905d	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:33:52.517
0f01a24e-99b2-4560-93b4-4fac0016062c	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:34:03.576
79b41b7e-9ab9-44b9-bcc4-8b30c9409d28	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:34:08.293
79815f5f-073a-4a4b-a63d-b7f4b8b1257e	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:34:10.456
905f472b-e830-4589-af31-8e2b3912d3ba	page_view	/	{"path": "/"}	tablet	New Delhi	India	2026-08-02 16:43:14.564
ce0e3646-9b64-4576-876a-27918545f508	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:34:11.367
d62668a6-92b4-459a-b1d3-df3c83a969fd	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:34:12.648
a995ac51-71d8-4e11-bf0e-427f8af1df90	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:34:14.09
444b6cca-f136-403c-85d2-14492c38f6e0	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:34:14.972
2b1ca9b9-21de-470b-a467-b26baddfcf6c	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:34:17.203
043d3085-4fab-4a78-b904-dac69e398ac2	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:34:17.938
03dd880b-e023-4d49-8cac-98bdcf3fcd4c	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-28 15:34:21.573
7456ee43-dc69-4697-b315-1f1f4b3de6b1	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-07-28 15:34:21.639
03be3cd3-fc54-4db1-a003-e4fadebded7c	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-07-28 15:34:21.737
44e40838-8f04-47f3-b922-591763543d63	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:34:24.425
aabf02d8-73be-48ba-95f6-b207530cc11b	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	desktop	Noida	India	2026-07-28 15:34:26.141
c77c1d26-9695-464b-9623-a9891ba8e823	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:34:49.764
9dc5540b-8805-4348-a2ce-07fdfb72793f	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Noida	India	2026-07-28 15:34:49.774
6f94be54-1f77-46b8-8da7-89e3998676e3	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:34:49.779
60a7bb15-70a9-475e-b9ed-8b26a19fc803	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	Noida	India	2026-07-28 15:36:07.736
2c2cd08b-9428-4268-b90c-3998823543d8	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:36:07.787
ce3268ea-3b1f-46ce-814b-d452f8cba368	whatsapp_click	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"source": "footer_strip"}	desktop	Noida	India	2026-07-28 15:36:38.405
22d373e7-b1bc-444b-bf33-9f718511e212	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:36:48.748
c888e412-4405-4868-b433-94f89ab66278	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:36:54.784
9b2d3d2e-e715-4f73-8cc9-5151ccf8a5f0	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:36:55.799
8457fd5e-520e-4177-bc2c-3e7ae37822ee	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:36:56.854
24907eb9-f79f-4bb0-971f-90cccc86f553	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:36:58.19
c66e8b81-fbfe-406d-b4ad-a98fd556d376	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:36:59.34
8eb541c5-1591-49b1-b218-a0fe80c5fe76	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:37:00.455
eb58141e-c0bf-4efb-9ddb-94d3a059245d	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:37:01.424
ba4481b5-ed7d-497f-b035-55eed80a2b54	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:37:02.362
2ce83ead-2e7b-4a9b-96be-246d1d975eef	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:37:05.092
4c74b80f-a1c5-4db2-abe0-efad895e2cca	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:37:06.106
79257514-0114-4861-844b-17c92bfe33f5	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:37:06.843
fae01104-82e5-4925-a74f-41b47ef408fe	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:37:08.274
5a3ca4bb-354c-48f6-8076-03c27e0b8420	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:37:09.36
f1bc0a79-80eb-4be3-ab38-359cc7170e1f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-28 15:37:23.971
42a2379d-c2da-4cec-8742-49badea876b0	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:37:25.532
818cf07f-6f82-496f-b08c-7107ac396f04	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-28 15:38:08.307
e045ce0c-2e8e-4d19-81a1-20fd0cf026ec	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:38:50.725
b1c87089-edec-4870-a5c9-c9d14448c748	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-07-28 15:38:57.046
c44c3b0c-8241-431b-a698-5c9182ea16b1	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-07-28 15:38:57.053
59352e21-8821-43f6-b93e-d58732c51e5a	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-07-28 15:38:57.057
1310788b-4162-4bb7-bb2f-a43b76802294	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:39:01.517
139c6871-2fa9-41a7-a2f5-9c2278865d62	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Noida	India	2026-07-28 15:39:09.724
be48ba05-ef0b-4694-ad78-b21094bc91e6	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:39:09.728
30fa1f09-023c-4da7-8ccf-0a769f21305a	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:39:09.726
3579f577-644f-4f59-a445-a3dbb3afdf7c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:39:31.574
8ca052f4-6bf2-4020-ac3b-bf95348a9097	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:39:36.373
8f7f88f0-a69f-4d8e-baa9-41ab7363ea8c	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-07-28 15:39:36.383
cb081c16-18b6-415e-bb11-4ee4ca15b91e	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:39:36.416
806f7252-0b85-4c4b-8c53-08165129b91b	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:40:03.108
6521c3f4-ac28-4818-9d74-9218acfc1164	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:40:07.701
dbb6652e-0276-4f39-9d4e-2e8b65bfbe2b	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	Noida	India	2026-07-28 15:40:07.722
01957e11-a44f-4350-bcf0-6886b185e4ba	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-07-28 15:40:07.745
3cd36a07-7fd6-4fd5-a007-5926a069424c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:40:10.764
213f6dee-a763-4e59-b234-76261201587e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-28 15:45:41.107
21a8fcfd-6b8d-4ffb-87ba-c1b44eb33a0e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:45:42.361
8af8e0f2-5b1b-4a84-9ca5-ed26e6f60346	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-28 15:46:32.03
9585c585-4af8-445c-adfa-43fc06855634	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-28 15:46:33.013
7feb01a5-471a-4d0a-80c6-a87d3de807ff	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:46:38.559
be2ef8e4-a0f4-4fcb-9d3b-ada74f37a289	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:46:39.527
9603ed68-6d43-4e41-a9f6-2f015901d96b	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:46:40.827
38e76693-8455-4de8-a572-ee7b70754dbb	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:46:42.097
ed8048b5-0ae6-4df9-befd-b52e2c3aa5fa	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:46:43.873
d6621f3e-0df3-4ed5-a7d3-7b8d1653346a	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:46:46.621
5a17fe22-d53d-49bd-89b7-317ee02e2ef9	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:46:47.727
2fd1e3fb-5335-48b9-b9b7-7792ff8af67b	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:46:48.968
4e602682-9089-4af8-b746-017a45e9e5f7	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:46:50.273
31029665-5d38-4024-a2f3-b1f1e3308f7e	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:46:51.347
36cf2a02-28ea-4617-af7d-7d5d36e88efb	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:46:52.749
f6bd8a7f-788a-4bb6-9fb2-5ce4f0e88e71	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:46:54.576
266162cc-e716-40aa-bcc7-44f1cad23e42	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:46:56.377
2fcae9a4-bdcf-4891-8440-09945bec438b	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:46:57.756
0e949276-5734-44a3-8669-e83c3e8fb9aa	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:47:00.105
ce00345f-e5aa-486a-a0c8-9eefbb27f385	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:47:01.274
ce7642fc-6b9b-4d18-8d2f-ebfb80bc87a2	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-28 15:47:07.737
651290ba-b87b-4001-bbed-bc7d2e1735cc	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-28 15:47:09.21
28f97968-0ee6-4b2d-a0c8-847270322798	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-28 15:47:10.327
4685f14e-daa4-43e8-83ea-24b5662363f0	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-28 15:47:11.98
c946795b-0c45-4d54-994d-d4a01f4ca6ce	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-28 15:47:13.403
52d9a159-3dda-4f9e-afcf-4c6aed50d2e7	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-07-28 16:20:06.326
df8025fc-9074-4a98-a647-5e7015a52992	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-28 16:20:18.825
c5318198-fda9-4308-8537-8d4bb3f34fc6	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-07-28 16:20:18.891
46bffc0d-3c56-4a0e-ac0a-5dccccd2be90	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-07-28 16:20:28.143
e5d095dd-1a9a-44f4-b16a-bde574929daa	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-28 21:41:11.951
dc4044a8-dd9d-4386-b412-ef8b65c50ebc	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-29 00:18:19.007
68da6e2f-1661-4f52-883c-acb8fff0fa63	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Mountain View	United States	2026-07-29 01:35:42.719
e5acc3e9-d401-4b5d-b6c2-87c876cb522d	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-07-29 06:18:44.152
45e1f5b0-ebb4-477c-a252-729c55e8dd3d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-07-29 06:18:45.596
c781a491-df25-49c4-8fdc-5eff01ac9b60	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	New Delhi	India	2026-07-29 06:18:57.106
f0cb1787-9f24-4723-a727-2575896af08d	page_view	/	{"path": "/"}	mobile	Chennai	India	2026-07-29 06:55:32.626
4ded887e-82e0-496c-98b9-e5e680c2986f	page_view	/products	{"path": "/products"}	mobile	Chennai	India	2026-07-29 06:55:44.772
81687431-066e-4dd2-9dbb-74896bd9569d	page_view	/	{"path": "/"}	mobile	Chennai	India	2026-07-29 06:56:00.829
bc7714fd-2d3f-4cce-88cf-de4830a22297	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-07-29 07:15:48.939
e35efe40-9820-4c01-9a47-16be833f317a	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-29 07:16:25.019
091ef02c-cb9a-4fc2-84c0-5f947a6e54ec	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-07-29 07:16:30.722
8e037c43-a703-4a18-9101-9db428df6cb1	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-07-29 07:16:30.738
bcdec205-81c1-4abb-b88f-8fdd294839c5	product_card_click	/products	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-07-29 07:16:38.849
8f7b5fe9-5565-45a9-a90b-e2b36377b7b6	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	mobile	New Delhi	India	2026-07-29 07:16:38.864
e72c1bc5-0785-41ef-9de3-fff94580e404	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-07-29 07:16:38.869
e33bbadb-6f9e-495d-87f5-0c91c65b0ee5	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-07-29 07:16:54.765
c02bdf36-d12e-459d-b5a9-f0174dc06f84	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-29 07:17:03.038
bc9d5bd0-dc79-47d3-a562-db4c5ea2e48d	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-07-29 08:54:53.606
536a113b-cba4-476b-a4b0-04abff3923c8	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-07-29 08:55:38.258
2de1fa0a-6bf9-471d-852d-5fefed131c2d	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-07-29 09:19:52.172
cfbb37a6-b1c5-43ae-85ab-df6cf09a9356	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-29 11:03:06.33
1bad166c-7e44-4cb1-9c87-64308e6e732a	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-07-29 11:24:34.689
83e17a09-8d3a-4a72-b216-deb765825722	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Bengaluru	India	2026-07-29 12:02:50.542
37cb6f15-c48d-4573-baad-249fec3c093a	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-07-29 12:02:50.559
45f469da-4306-46ee-8864-178a11212c38	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-30 02:51:08.99
34addacc-4fc3-488d-8711-4bacf3fd98be	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-07-30 02:51:12.669
926f8cec-cb11-473e-86e2-7c0e8e397284	page_view	/	{"path": "/"}	mobile	Nashik	India	2026-07-30 04:32:25.397
fb26d3d8-51f1-4fc2-9120-0e96cb7b21d1	page_view	/products	{"path": "/products"}	mobile	Nashik	India	2026-07-30 04:33:08.213
e948bd9c-adba-4c7b-8c57-eb7469318612	page_view	/	{"path": "/"}	mobile	Nashik	India	2026-07-30 04:33:33.085
4bfac3b8-65f6-4b7d-831f-7637e5c5dfde	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-30 08:26:03.633
cacec651-af35-4c35-9782-238c031ed9fc	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-07-30 08:26:48.12
71307791-9012-46e5-a944-539bf84ca781	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-07-30 08:26:54.782
d8ac0d81-0d97-401d-a317-82699f026425	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-07-30 08:26:56.3
e272920a-6b49-45c4-9329-b1d2b0f78119	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-07-30 08:26:57.196
0ba66b3e-ea29-48f9-ba9a-e00a3c02eb0c	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-07-30 08:26:57.775
702daa09-37d7-4331-be28-80797e010713	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-07-30 08:26:58.799
0f02030c-2830-491b-ac3b-31460e557be7	page_view	/	{"path": "/"}	desktop	Noida	India	2026-07-30 08:27:03.247
eed0fd1c-f450-4f49-b921-07b1a23225ff	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-30 14:36:46.62
81c14f8c-eeb6-4211-b738-fc4b32dc5abc	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:36:55.053
85f3bef1-8f59-49a0-b7e0-cc5d866de84b	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:36:55.058
7b5b31ee-0dcc-4d0a-8085-039343e7a9cb	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Guwahati	India	2026-07-30 14:37:11.893
fd59d4d4-aee5-47ed-818b-33f4d4cd4b93	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:37:11.896
213cceb4-30ec-4ed8-b10b-8916e37d25f4	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:37:11.957
b6203e24-d626-45cd-87b6-eb79f5a74d4a	product_card_click	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:38:33.588
75e52157-41af-4830-9556-183bfd390458	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Guwahati	India	2026-07-30 14:38:33.597
16c734c6-d21b-4bbc-8a27-06925ada2425	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:38:39.212
9b885032-a99b-4565-b318-e8ef67b93a49	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Guwahati	India	2026-07-30 14:38:50.357
cb4c43f3-486d-4953-a895-9f69caad17a7	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Guwahati	India	2026-07-30 14:39:00.016
27d302aa-e934-4c97-b1a6-b52cc21093c6	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:39:12.728
647ff4d6-ea73-4283-9f2e-acfb7f3f4184	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-30 14:39:21.775
a6789795-b578-4cee-8a7c-38a2c609a9b4	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:39:33.53
b6a1cdf2-7866-4f62-b3fd-a003d1576c9e	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Guwahati	India	2026-07-30 14:39:41.747
3b6d2c28-846b-43fc-8ed3-13d4014208ba	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	Guwahati	India	2026-07-30 14:40:42.074
9eef1f09-6d85-43fc-b53f-c7d5e739282f	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:38:33.598
41549e97-b664-47a6-be33-47e23d7cfd1d	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Guwahati	India	2026-07-30 14:38:39.21
4e7e2b66-7a31-4c4c-993d-4080b4fb8800	product_card_click	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:38:50.357
8d69456e-b491-42e5-bff7-d8b04c662b1c	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:38:50.413
6a9303c8-bde0-44e2-bb4d-30f55de6ef40	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:39:00.015
383a7849-c5aa-4977-923b-12a56ffe454f	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:39:33.532
9446053f-b3e1-48cb-ab26-7bd47ce031ab	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:39:41.746
7fc80d6d-0eeb-46a0-9726-830d1f651c16	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:39:41.748
4f9475d9-2e64-4f7e-a0cd-c40023ad62c8	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:40:33.569
d5a1c98a-c373-4d8c-980c-1452a448d9dc	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:40:42.073
ce69d360-7a2a-4c3e-a7e2-d7074b8f2d60	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:40:42.075
173ecd2a-f345-434d-b335-ff1a352fb2c4	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:40:54.689
53db2d5e-c233-4101-bcc2-0a54835119e7	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-30 14:40:55.355
ecd15d1c-8821-4d8f-9830-8322dc8dbf73	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-30 14:40:59.59
63e22d11-e624-4b83-9f7a-89bee8c006f1	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Guwahati	India	2026-07-30 14:41:04.955
a06b5442-d39e-4f98-b8b5-9c58616cdcd2	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:41:05.047
7b811c89-d20c-4a7d-b8cc-5421cdd64d12	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-30 14:41:07.401
9278e7ba-a440-4010-adc9-3fb3a33d3cb5	page_view	/products	{"path": "/products"}	mobile	Guwahati	India	2026-07-30 14:41:09.474
c33fd625-be48-4a3c-87b5-16840e7c1882	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-07-30 14:41:37.934
8ae0d40c-651b-429f-999a-ab38a68d4964	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-07-30 15:17:24.136
6888d80a-0606-4a80-bb21-25a9edb8061b	whatsapp_click	/	{"source": "hero"}	mobile	Hyderabad	India	2026-07-30 15:17:25.797
103e4188-4292-4892-9796-4b29af50f8af	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Hyderabad	India	2026-07-30 15:17:37.482
17d2de4a-c91e-4ad8-bb1a-276bfe28914d	page_view	/products	{"path": "/products"}	mobile	Hyderabad	India	2026-07-30 15:17:37.487
5571ca6d-09cf-45a7-a394-90eb8e312df1	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-07-30 15:17:41.896
88f69212-6eef-496b-9c16-4c8aa555cfa6	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-30 22:01:36.064
95a8a64d-f203-4b0f-a2f8-f978e811c547	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-07-30 22:01:42.032
e4fddfd5-dbb7-4efd-bf5a-906aadb6916c	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-30 22:02:05.228
5cf819aa-ad41-441b-a035-ac416b91fd48	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-07-30 22:02:11.786
53dd9818-c54b-4575-936c-3d374a92dbfc	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-07-30 22:02:11.82
1ea74647-9e8a-4849-b2bc-8613da7bd554	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-07-30 22:02:24.777
5b7e2119-6e04-4519-b56b-0686b4f54df2	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-07-31 01:07:03.301
93f703cc-5c77-4c9e-bf70-752202683c1a	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-31 02:42:44.26
9e712712-c6f5-4f36-8b70-ce65b3484ea9	page_view	/	{"path": "/"}	desktop	Quincy	United States	2026-07-31 03:13:13.202
21b92cf2-df22-485c-8703-8edfd0da1b0c	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Mountain View	United States	2026-07-31 05:12:45.574
e5f5a020-15a8-4ef9-8c5d-2ded692d4732	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-07-31 05:12:46.167
4db75270-07db-48b8-ae6c-2db23e1b6053	page_view	/.well-known/apple-app-site-association	{"path": "/.well-known/apple-app-site-association"}	mobile	Mountain View	United States	2026-07-31 07:03:54.925
052948c6-5d3a-464e-95cf-11a8af93deb3	page_view	/apple-app-site-association	{"path": "/apple-app-site-association"}	mobile	Mountain View	United States	2026-07-31 07:23:00.03
ad35f426-5632-4f14-b6ff-8ab6e25c6c1c	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-07-31 09:31:32.063
82a24e72-62bf-4fcf-b8fd-f03fd79558d1	page_view	/products	{"path": "/products"}	desktop	Delhi	India	2026-07-31 09:44:02.462
7ca4043a-1d3b-41fc-9449-3eeabd49d76d	page_view	/	{"path": "/"}	tablet	Mountain View	United States	2026-07-31 11:12:55.726
81f2ec66-33e8-41a9-b0f0-b7c86b649e05	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-07-31 11:14:22.779
26ef4cf5-c380-4c15-9c81-e8d9aa370b73	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-08-01 05:07:17.213
9762e7b4-4f09-4b90-b9ec-126c60a27d79	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:07:35.167
6572a882-89ac-44a1-9c5e-47d656cdfbd8	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	Bengaluru	India	2026-08-01 05:07:52.934
22d981f8-20fc-46c7-86ee-ddd77d3a4409	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	mobile	Bengaluru	India	2026-08-01 05:07:52.97
8e5bbb35-7c6f-456f-bdd1-c6a000f9b9d6	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	Bengaluru	India	2026-08-01 05:07:53.012
5292240d-a5bc-4c97-84cf-e3b753699d67	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:08:24.546
8913a403-f561-4741-906b-13d6a26d79e9	product_card_click	/products	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:08:37.057
d4a28467-e3a5-4d25-b4a0-1cd11cbd55c0	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Bengaluru	India	2026-08-01 05:08:37.096
7f388388-2848-4f2f-812c-f1bab839599b	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:08:37.158
0fc3877d-7a94-4df1-b5d4-a1e3a83df49c	product_card_click	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:09:53.816
7492e2a4-1236-4020-aa79-fb198df6ebc8	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Bengaluru	India	2026-08-01 05:09:53.862
470fe35b-cc63-4b1e-aa03-c4a4e49ec9ce	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:09:53.868
872e6e86-f5f8-4151-84f6-513387b85be7	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Bengaluru	India	2026-08-01 05:10:20.576
9db37551-e85a-4264-a8c9-fbed65fc1342	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:10:20.585
4220201c-6ce4-4881-9a61-b9553dcc77d0	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:10:23.154
92353696-a473-4c33-83bb-77463df3746d	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-08-01 05:10:24.229
466bbc32-f6be-4a28-a123-4c722783b5c6	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:10:29.432
7b08fc00-e8fd-4001-b0b4-2a613fbfbfde	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:10:29.462
06307bd2-abb0-4d8b-8336-782b3f9398b2	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:11:24.934
7119083d-3b6d-4f31-a6b7-241555a0f739	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	mobile	Bengaluru	India	2026-08-01 05:11:24.949
ef8ed061-580b-48b4-9d5e-6f10da3e86ad	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:11:24.973
cbcec062-7602-4f20-bbeb-ac032578d565	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:12:07.725
2549ae3a-ab79-4fb7-8c29-5698548d48ca	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	mobile	Bengaluru	India	2026-08-01 05:12:15.336
8c9d9ad2-8eec-408b-b6d4-df381dbe487f	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	mobile	Bengaluru	India	2026-08-01 05:12:15.339
56b077bc-a273-467d-b8b7-87db45142231	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	mobile	Bengaluru	India	2026-08-01 05:12:15.355
35431531-28a6-4a93-aef8-a262171bb3be	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:12:28.5
302e3435-9087-4c5f-8470-cc9e68ff4c46	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	mobile	Bengaluru	India	2026-08-01 05:13:08.591
1c4a027b-e7ca-4101-b352-a2c7abf8d535	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:13:08.61
c5470c5c-34c4-4db9-adf4-188fa9abedaa	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:13:09.55
959d6ca8-5c58-44f3-84a7-71c858f11529	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-08-01 05:13:10.768
d09c59c6-638e-4713-8817-05f9401b0bb7	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Bengaluru	India	2026-08-01 05:13:14.581
83360db7-87a6-48d5-b7ee-f2d7ceaa275a	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:13:14.683
74d48fa5-b413-411c-944f-5482ef54d6c9	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-08-01 05:13:24.437
b0535671-baaf-47c0-b19e-1cf386e87b0c	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Bengaluru	India	2026-08-01 05:13:35.782
25da73fb-9d33-48c2-aa9e-c806e72cccdb	page_view	/products	{"path": "/products"}	mobile	Bengaluru	India	2026-08-01 05:13:35.811
36a4b608-84f2-479c-b60d-317aaafa259c	page_view	/	{"path": "/"}	mobile	Bengaluru	India	2026-08-01 05:13:45.346
7d5212c8-d03c-46af-a528-e1610e74a892	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-08-01 06:09:28.335
69b129ee-dcca-4c14-8090-8f3db8944e68	page_view	/products	{"path": "/products"}	desktop	Hyderabad	India	2026-08-01 06:09:31.636
62643fe9-45e0-4663-8c16-1e01a515c964	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Hyderabad	India	2026-08-01 06:09:43.809
973e3aaa-4e67-4bb5-b9d1-bebfef5ccdc8	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Hyderabad	India	2026-08-01 06:09:43.891
1f6073bb-5319-4bd4-b37d-f446d34df934	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Hyderabad	India	2026-08-01 06:09:43.892
b29c8b41-af14-4211-9396-af866e23c1cc	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-08-01 06:11:25.164
5694139f-b298-428f-b00a-22eea44edbbc	page_view	/products	{"path": "/products"}	desktop	Hyderabad	India	2026-08-01 06:11:26.784
1282eedc-dcf6-43b1-8ecc-e8909092389d	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Hyderabad	India	2026-08-01 06:11:50.778
12eea24f-696f-401d-8e37-e41341a372f8	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Hyderabad	India	2026-08-01 06:11:50.788
0defddd1-186b-4749-9ed6-915ee688edb2	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Hyderabad	India	2026-08-01 06:11:50.796
08885d0e-2fc1-4c13-bfd8-cc162d4bdd1d	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-08-01 06:11:58.484
37e6828c-ef30-4925-b155-61a1ddb36716	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-08-01 06:12:55.009
b96a35cd-7402-406f-ad99-90de42503233	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	Hyderabad	India	2026-08-01 06:14:42.461
057710e8-2c4d-4093-995e-da2d1ffd8dd2	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	Hyderabad	India	2026-08-01 06:14:54.956
9cc79799-3537-4b7d-9286-5193b3703564	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	Hyderabad	India	2026-08-01 06:16:38.204
a5cf4414-d345-4a25-b2b9-fd5697845303	page_view	/	{"path": "/"}	tablet	Ashburn	United States	2026-08-01 06:40:27.776
2854957e-acac-4dbb-94c5-03f5d02b968e	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-02 02:53:45.356
e8637e70-7b8c-4269-8496-6d7a4fe0f403	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-02 02:54:05.932
cd58c6d2-7bfb-4d3b-b373-d3cf1c43d541	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	New Delhi	India	2026-08-02 02:54:42.551
c3e8e51f-b22b-4c62-a421-a4d022281863	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	New Delhi	India	2026-08-02 02:54:49.581
07d18597-001a-40a4-8e24-01f9c9058b82	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	New Delhi	India	2026-08-02 02:55:10.896
2a624d24-82d7-47f0-b393-27312ad163f9	whatsapp_click	/products	{"source": "footer_whatsapp_block"}	mobile	New Delhi	India	2026-08-02 02:55:37.756
372953cd-0963-4355-8982-145596f92379	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-02 09:22:43.091
cd7d9a0c-e500-4f72-b596-f011bedd88c4	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-02 09:22:58.871
73876587-e0e5-4e96-899c-daa1a34bdecf	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-02 09:22:58.871
2a7edf7c-43cd-4a95-84b9-25c3a16d9b6d	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-08-02 09:26:16.86
dd7fa317-7cbc-4386-8dfa-74e644f791e9	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-08-02 09:26:27.778
f4e5c642-d353-487f-9f29-a437bdc1838f	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-08-02 09:26:55.941
2059486c-cea1-4110-9d3d-32eb66653a91	product_card_click	/	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-02 09:26:55.942
acefbfd9-41b3-4978-8d6d-ad302a050732	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-02 09:26:55.955
5ea79160-7716-4de8-ae60-6975bc5d9eac	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-02 09:26:58.397
b2c81cac-e3c0-4c83-bf9d-4d566604f5e8	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Delhi	India	2026-08-02 09:27:01.293
17f5bf25-dd70-40ce-a70e-a37a54d63ac1	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Delhi	India	2026-08-02 09:27:01.355
3927ec1d-6864-455c-ac77-a787f0125b5c	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Delhi	India	2026-08-02 09:27:01.363
7c6a6cc5-25b1-42f3-8cb9-76561a426a57	whatsapp_click	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"total": 10500, "source": "product_page", "quantity": 50, "productName": "Oversized Tee Bio-Wash.", "pricePerUnit": 210}	mobile	Delhi	India	2026-08-02 09:27:09.425
bb032e2c-55db-4922-92db-1bc3dd6ab3e2	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-02 09:27:17.886
bd5f5b11-1875-48fe-9a7c-b24f020a84f3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-02 09:27:18.076
09eb6e8f-73f1-4f32-a79c-e455df940730	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-02 09:27:18.138
c6fa834f-bfd6-40f8-aa07-587583e2f0bd	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-02 09:27:44.426
9cdaa39d-9b0f-401b-a3ef-4ecea80d3ac1	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-08-02 09:27:44.464
73c505bb-2c12-4b01-bb4e-775b0c1f0f77	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-08-02 09:28:04.494
de34be08-3c1d-47f8-890d-afa92c1a51e8	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Delhi	India	2026-08-02 09:28:04.5
2f2e1f40-1d8d-4624-86db-954964edf35e	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Delhi	India	2026-08-02 09:28:04.52
30788922-fff0-4778-a0a8-fbaa31627449	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-08-02 09:28:12.925
89bf1b2b-46ca-4b11-8417-a2f0119a81e7	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Delhi	India	2026-08-02 09:28:36.73
dd994aac-bac7-484d-8a3e-2b5488cb189d	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Delhi	India	2026-08-02 09:28:36.739
d35e23f1-b61d-4f4c-8d40-9cadcf17520b	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Delhi	India	2026-08-02 09:28:36.747
5f802f72-5f71-4b8f-83fb-8b4c582928b8	whatsapp_click	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"total": 10500, "source": "product_page", "quantity": 50, "productName": "Oversized Tee Bio-Wash.", "pricePerUnit": 210}	mobile	Delhi	India	2026-08-02 09:28:43.032
052f43d8-6b37-4fd3-bce5-719023370b0a	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-02 09:28:47.636
eb27b2bc-848e-409b-89d3-aaa8fc2a63f5	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	Noida	India	2026-08-02 09:28:47.636
89d472b7-df9a-4595-892a-719d93029c8b	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-02 09:28:47.72
aabd2ac1-3dbe-40e6-b107-a1ee622eb35d	whatsapp_click	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"total": 4250, "source": "product_page", "quantity": 50, "productName": "Round Neck 112", "pricePerUnit": 85}	desktop	Noida	India	2026-08-02 09:28:54.594
f5e12aca-54c7-4485-8e87-1f78ff143270	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-08-02 09:29:25.221
ccb43a59-92b6-4738-b485-4013ec77ddfe	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-08-02 09:30:06.474
e3609e4f-1f5c-4633-a897-98b7dc825c54	page_view	/	{"path": "/"}	tablet	Delhi	India	2026-08-02 09:31:01.115
e1bb3acb-e515-4561-82a8-f35c60dc4e8a	page_view	/products	{"path": "/products"}	tablet	Delhi	India	2026-08-02 09:31:23.67
ca8608ef-2cb3-4a51-ba2f-b88b25e9ddcc	page_view	/	{"path": "/"}	tablet	Delhi	India	2026-08-02 09:31:29.244
eb32288b-6110-4d20-bb42-8236145e4770	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	tablet	Delhi	India	2026-08-02 09:31:32.467
20f2c808-d637-4838-a4df-c4a89d66a003	page_view	/products	{"path": "/products"}	tablet	Delhi	India	2026-08-02 09:31:32.524
e8baf160-11d7-489a-bc3b-63f1c561c85b	page_view	/	{"path": "/"}	tablet	Delhi	India	2026-08-02 09:31:34.335
1b598e9e-ef58-4cfa-a11a-b9979d8afb45	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	tablet	Delhi	India	2026-08-02 09:31:35.454
c353e92f-3e6e-4da4-8b2e-6333646504a0	page_view	/products	{"path": "/products"}	tablet	Delhi	India	2026-08-02 09:31:35.55
0719bad8-cc4c-436c-b29c-350fd9beddde	page_view	/	{"path": "/"}	tablet	Delhi	India	2026-08-02 09:31:36.873
3d95b2fb-c6f2-44e4-8538-e8f3a17db545	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	tablet	Delhi	India	2026-08-02 09:31:37.854
7322170d-4166-4431-b802-114cd4788ca4	page_view	/products	{"path": "/products"}	tablet	Delhi	India	2026-08-02 09:31:37.87
0405192e-863d-426a-9d2c-7249d591b32f	page_view	/	{"path": "/"}	tablet	Delhi	India	2026-08-02 09:31:39.248
fc730747-cb40-49cd-b083-9faff2b5ed75	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-02 09:31:50.173
6159e45e-23b6-4941-829a-00199602596a	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-02 09:32:04.115
79b683a6-66e3-4bf8-8a99-69a95606334c	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	Noida	India	2026-08-02 09:32:04.116
db90cbbd-e345-43f6-85fb-ebc19b8b2ce7	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-02 09:32:04.161
59364cd2-381a-4da9-b7ee-a070ee35a885	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-02 09:33:43.502
8992402e-09b2-4faa-8948-92b5a3dd6433	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-08-02 10:03:40.15
b2f5ce13-5fef-4ce0-a163-cf28025712ca	page_view	/	{"path": "/"}	tablet	Delhi	India	2026-08-02 11:28:07.169
dc0e2f30-0f84-4e41-b010-92aace049d56	page_view	/	{"path": "/"}	tablet	New Delhi	India	2026-08-02 16:38:37.136
81b2c64b-2990-4011-a435-bb40baea29ac	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	tablet	New Delhi	India	2026-08-02 16:38:51.741
1ee8ada1-23ba-49db-a40e-45eeed77033d	page_view	/products	{"path": "/products"}	tablet	New Delhi	India	2026-08-02 16:38:51.791
69571249-8f0b-47a7-966f-c49c091381f9	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	tablet	New Delhi	India	2026-08-02 16:38:56.439
786acf1f-1e0d-4553-812b-60f7c00a2cbf	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	tablet	New Delhi	India	2026-08-02 16:38:56.439
72fbba1e-f778-4ea0-8d16-d6090e1df81d	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	tablet	New Delhi	India	2026-08-02 16:38:56.509
db132d53-b86c-47ca-9256-f0c87dcde014	page_view	/	{"path": "/"}	tablet	New Delhi	India	2026-08-02 16:39:46.775
e25d7d65-5104-47fe-ace8-c1a0b91a5cc9	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	tablet	New Delhi	India	2026-08-02 16:40:21.958
7aa77fdc-79c1-423f-9702-d8798aab02ea	page_view	/products	{"path": "/products"}	tablet	New Delhi	India	2026-08-02 16:40:21.958
b742a192-0b9a-4f3c-8457-b6d029a219aa	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	tablet	New Delhi	India	2026-08-02 16:40:27.669
112254b4-0f7c-4e8f-bf77-0bbbad6848db	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	tablet	New Delhi	India	2026-08-02 16:40:27.68
08f97dc6-ad1a-4337-89ba-064b8db5b807	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	tablet	New Delhi	India	2026-08-02 16:40:27.683
4a3f582c-8117-4225-b374-1ec1519bfdd9	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Mountain View	United States	2026-08-02 16:41:00.404
7eeb6884-d0a3-47c5-8669-4a23dc16e4ce	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-02 16:41:00.884
2d8e2df6-fcc4-4f31-a427-8f49272cd128	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	mobile	Mountain View	United States	2026-08-02 16:42:01.748
025b6b9c-0d16-4854-a3bc-0c9a54938c0c	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-02 16:42:02.854
d4db8c12-7e98-4c53-b7aa-3e0f0522235e	page_view	/	{"path": "/"}	tablet	New Delhi	India	2026-08-02 16:43:08.599
e9427d70-2802-4d23-92de-0f78fa34a0e2	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	tablet	New Delhi	India	2026-08-02 16:44:18.55
55404501-3c14-414c-98d1-8e65d428421e	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	tablet	New Delhi	India	2026-08-02 16:44:18.589
f144f26b-2a37-47c6-bc8a-c16d3f473353	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	tablet	New Delhi	India	2026-08-03 03:07:13.727
efbe5555-7aae-46e5-aacb-915dda3a08b1	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	tablet	New Delhi	India	2026-08-03 03:07:13.764
3889ce2d-b24f-49b2-9805-a400505950bc	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-03 09:31:55.883
22885e31-6da7-4681-bd96-25dc1d9e6e03	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-03 09:32:05.015
39529957-0e7d-42dc-a24d-3b3225bdfe41	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-03 09:32:08.59
af10f44c-92ef-4b78-8517-2668536c7209	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-03 09:32:10.948
12bfc7c5-8cf6-4c0d-a255-b449f0318624	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-03 09:32:53.381
0c49839c-778d-487b-b835-cb9d772a9ebf	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-03 09:32:53.399
98c7bdca-39fb-48f2-af1e-7527068a9fc7	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-08-03 09:32:53.382
7b94be05-58a6-4e5f-83ba-18e510e97279	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-03 09:32:59.067
5c05a106-a840-41c5-96b4-cabf9ce95c14	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-03 09:33:03.785
94905b6b-277d-424c-9c42-5824f0c45d4b	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-03 10:13:54.765
ba5b42cf-6f5a-41a3-9efd-58357173bbba	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-03 10:49:12.841
ee47e6cf-b1f0-41ac-9c87-490e17605104	page_view	/	{"path": "/"}	desktop	Ahmedabad	India	2026-08-03 11:27:17.661
f4dd3b89-236a-40b9-a226-dfea8f327d0f	page_view	/products	{"path": "/products"}	desktop	Ahmedabad	India	2026-08-03 11:27:41.231
9769cf8a-74a5-4067-90a1-a39ce13dd587	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Ahmedabad	India	2026-08-03 11:27:41.235
ff620ea5-ba09-4f46-8922-a35f33396b17	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Ahmedabad	India	2026-08-03 11:28:05.972
67402a55-a44b-4a58-9427-630a6b73863f	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Ahmedabad	India	2026-08-03 11:28:09.251
b186968b-36a0-4085-9e1e-6db4e424a774	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Ahmedabad	India	2026-08-03 11:28:09.931
8b4434f4-e955-4eba-8610-52686eb3a16c	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Ahmedabad	India	2026-08-03 11:28:11.362
ba624dff-7a1f-4c18-aa06-d680d74bf01c	page_view	/	{"path": "/"}	desktop	Ahmedabad	India	2026-08-03 11:40:32.525
1f82b96f-94ec-4af8-9764-b3954f75b19f	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-03 11:41:21.784
a4468211-072b-48e3-8ef6-f996fb692344	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-03 12:38:05.596
0e17ec8a-ac0e-4c90-a50b-f1194e2fa720	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-03 13:05:18.392
8ad16d70-5ef7-47a4-941f-a28f20ef1437	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Mountain View	United States	2026-08-03 13:05:38.523
1c2a0ab4-f08e-4a00-a20e-7d7ee2efde7e	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-08-03 13:05:39.168
a290ac36-3145-4f33-91fb-c647affa50d6	page_view	/	{"path": "/"}	mobile	Gangtok	India	2026-08-03 13:21:34.305
52fdbdb9-f7be-497a-9445-d0090e891bd1	whatsapp_click	/	{"source": "hero"}	mobile	Gangtok	India	2026-08-03 13:21:38.644
baa9a90e-df05-440a-a62f-3547878b2b7b	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Gangtok	India	2026-08-03 13:22:07.106
6ca455ea-890c-418a-8dd9-e2eda884b5e7	page_view	/products	{"path": "/products"}	mobile	Gangtok	India	2026-08-03 13:22:07.145
e384a221-5c68-4758-889c-cc79b091078d	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Gangtok	India	2026-08-03 13:22:23.218
fa19c7cc-9425-4d19-8835-e94ad885185c	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Gangtok	India	2026-08-03 13:22:25.179
2bd3bac3-2728-471e-98ec-16dfbcf9a19c	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Gangtok	India	2026-08-03 13:22:27.128
71055d59-a141-4bb9-84c8-e5c79a1842cb	page_view	/	{"path": "/"}	mobile	Gangtok	India	2026-08-03 13:22:44.103
c93b024d-5d72-4758-9342-2b6ab8c2b462	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-03 13:59:07.201
1b16b188-86f3-485c-b7c3-4ee31e5e6f64	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	Mountain View	United States	2026-08-04 01:25:19.409
36ac893e-96eb-497f-9528-2f7e2a33e32f	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-04 01:25:20.019
e95b3cd9-b4b0-444b-865e-cdbdf851dba3	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-04 05:27:27.88
340b5c45-ff30-446e-a45a-68c16847b439	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 05:27:39.852
07faaf54-40dc-4c74-a2c7-e820b9ea7df8	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-08-04 05:27:50.078
8b66256e-a5b3-4b9a-abed-ad9a51e3df1b	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	desktop	Noida	India	2026-08-04 05:27:52.165
2bfa51f4-de95-4bff-afb1-c07b282f6188	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 07:17:00.414
7b1108b6-1cb8-4f65-9ba3-3b8f90a383e7	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-08-04 05:27:56.072
be7c131d-9531-4093-9459-f0e79a7c7bea	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Noida	India	2026-08-04 05:27:57.487
f6062335-c689-4956-ad32-897815980d4c	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-08-04 05:28:02.866
886576a2-c30b-40ec-bedb-b696e7a37486	product_card_click	/products	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 05:38:30.524
4e8cbf3e-7aba-4cb1-b2d1-d70183b6b04f	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	desktop	New Delhi	India	2026-08-04 05:38:30.846
4d30d8c7-b728-4c1d-967d-e6db03173191	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 05:38:30.905
77cec2b7-404b-407d-b154-95772ac784ae	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 05:43:28.038
635d27f4-2be7-452c-980a-2f4985a71a0e	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	New Delhi	India	2026-08-04 05:43:46.191
8212c98a-aef5-4ce3-b834-8161272771eb	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-04 05:43:46.192
2d672eac-7d9f-4065-91ad-cada94cd4c0f	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-04 05:43:46.684
9428f532-a3c8-49cf-8704-c81880bc7c99	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 06:22:00.291
df0d9087-ed25-4a70-a3b2-f8579c80a8e4	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 06:23:04.92
60ba6a42-75d2-4aeb-8004-e59635d565be	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 06:23:04.92
3f3b8fb9-2c67-45e5-a7e8-8b0492828e1b	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-08-04 06:23:04.923
8f7d3f4c-d96e-4177-acd3-6fbf50fafd86	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-04 07:36:06.651
0696e1df-94c5-47f7-aa5b-758ea58d1596	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 07:36:07.334
a5c60dbd-0d6b-4942-89d0-6804fd0a72fd	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:36:14.321
dc29f0f6-5f62-43b4-aa97-57780c3b13f1	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	New Delhi	India	2026-08-04 07:36:14.321
035c4e4d-8593-4bdc-8c7b-87a5dff51520	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:36:14.564
c4ff3c16-953c-4d56-a2e9-da157a308119	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 07:36:40.205
18da2c89-dd1c-4f21-877b-04aa91ebbbac	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:36:41.448
07f44d87-5677-4085-a18c-5b1b4d8a2a36	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:36:41.544
aa2cd8f1-6473-478b-ba62-a09821df42af	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	New Delhi	India	2026-08-04 07:36:41.544
90aa84b2-f770-4c7b-b929-d38b4c927ec9	product_card_click	/products	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:37:38.255
7eaacbeb-8bbe-4bad-abb7-461a869ffc29	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	desktop	Noida	India	2026-08-04 07:37:38.792
aa327a22-cb94-49d2-9f63-fbd417236bee	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:37:38.871
cc9f5edf-8ac6-4dca-8317-2529c40daa79	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 07:37:42.195
1db854e0-ab3d-4ac1-8f2d-9a1346252360	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 07:37:50.207
e169954e-80d9-4761-b009-b482ae541fd5	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-04 07:37:50.718
bf35ece6-3d5b-4e45-afee-e2b09a891359	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-08-04 07:37:50.797
7df0b2d5-7ff9-4e01-8237-06a53dc60e2c	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-04 07:37:52.695
596700e1-6056-42a9-b590-faa2cc2035dd	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 07:38:04.912
aa4557ba-ab41-4799-8d52-a1996d33e286	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 07:38:05.411
52344ab4-70f6-4635-8cef-6fcb038f85cf	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-08-04 07:38:05.733
c79e04f2-2a15-4adc-94f0-fca626bf4d7c	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 07:38:06.02
f2917e6b-0079-4e0a-8508-36f1f587a5f1	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 07:47:56.862
26fb3d19-ca94-4334-84b5-3e2b0080d926	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	desktop	Noida	India	2026-08-04 11:06:33.474
a805141e-2c8b-4720-983a-52803235a87d	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 07:47:59.699
235315bf-3211-4393-9943-e6e448a7d5d3	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-04 07:48:00.272
2146be08-81da-4478-bc74-b0c671205bf9	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 07:48:08.353
921c83b4-b3a2-4dd4-b8c6-0fbb928d76b4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-04 08:45:52.847
024f402f-4c27-4ea3-94ab-14718c3cf049	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 08:47:01.176
c40bc219-5263-4aa1-9c0e-ac796047dfe0	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 08:47:17.634
7df4f521-cdd1-4c28-a3fe-4f03c8779b59	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	Noida	India	2026-08-04 08:47:17.732
09c65564-9ebf-4964-870f-1e242df1ab23	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 08:47:17.799
f3680a34-9696-4992-af13-c2ab8d8ddd47	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 08:47:33.055
0dfd686f-0c52-47b1-8fc1-328c38ac31c0	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 09:28:00.555
0d3930cc-ea88-45eb-bf03-439c92c41f92	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-08-04 09:28:00.573
3a867b34-6d0a-403f-a121-de3e9dec1223	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 09:28:00.607
4ef87df1-f182-4cf6-bfd5-22520ba1bfa6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-04 09:28:29.921
2058bcd7-013b-461f-b0c7-3782c9c60c44	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 09:28:40.27
d3135292-7080-46f8-9500-c6d11d6f56fe	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Noida	India	2026-08-04 09:28:55.59
ea4ceb53-a757-4c26-8b50-f53d58084d7c	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Noida	India	2026-08-04 09:29:09.288
d9b7c15b-a224-4ed2-9518-79ea251a5e01	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Noida	India	2026-08-04 09:29:15.373
973a4acc-59fc-4ea4-8db7-eafe71a32a51	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-08-04 09:29:45.189
66ebab2c-e520-48b3-b222-0032a31c60d8	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-04 09:29:45.191
3ca39ffd-643e-4d87-9a2b-3e85ea0eccbe	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-04 09:29:45.197
70a49e19-e23d-4cf7-89fe-da9b8750588f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 09:32:16.074
90dadb07-821d-4d9b-b4f8-b6f373c4fcdf	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 09:32:17.602
3f97eed2-6aec-4621-8021-b9701a2faca8	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-04 09:32:17.68
589d1c31-592f-483c-ab7b-a3456d8cb165	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 09:32:18.182
2c1f8250-0abf-4b3e-8111-695495965944	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 10:07:22.94
b56966e2-2885-4290-8555-2a6a4e7756ea	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Noida	India	2026-08-04 10:07:26.774
19e2642f-614d-4f1c-9327-60932047e782	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 10:07:26.834
bf34b552-462a-427b-87bd-0554f7c49a48	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:07:27.389
dd015120-4176-4796-95d4-841d7bbab8f7	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:15:14.799
c6beaa02-8083-41ce-ac19-470170a0e9de	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 10:15:16.48
a673055e-6ff0-4af8-9368-a8b10e08a0d9	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Noida	India	2026-08-04 10:15:16.585
93f6f0f6-f842-4a5a-9de7-81ff69bc43b1	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 10:15:16.688
03ebeca6-3966-4607-83cb-a1a0f682e672	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:24:01.139
56666726-2069-4368-8d83-7428d035b952	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:24:03.537
33efa117-9168-444e-9777-f26df1193850	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Noida	India	2026-08-04 10:24:03.594
993e070b-6bd6-473c-8b36-2f8514469ccf	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:24:03.64
37fe5cbc-3ff8-4718-b8e2-9da8459f1b21	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:24:27.762
3c7c95f9-5486-426d-8709-baa604db66d3	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 10:24:30.061
99d4e97b-7956-469f-86ab-feddd093f520	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	New Delhi	India	2026-08-04 10:24:30.117
42650771-5236-4f01-a5c5-797c263724f2	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 10:24:30.578
182e4b7b-3746-43a2-b80b-36e23cf015f3	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:26:40.883
467bc052-9d45-4b09-9b5f-474af0a1d6a0	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	desktop	Noida	India	2026-08-04 10:27:11.728
76f38063-b035-419e-9e51-d9e4620cbe3c	product_card_click	/products	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:27:11.857
3eed6c23-bbd5-4043-97a5-c834f5e3d609	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 10:27:11.912
f6d40eb0-f829-4a6a-9b70-cf44956d4d20	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:32:12.456
c866b8c2-6e7f-4258-8b22-05b9e6c39246	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:32:17.78
14eeb9b5-a4fa-4a19-9cff-40283841cea6	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	desktop	Noida	India	2026-08-04 10:32:17.887
f7911d75-c331-4bd1-a9a4-6e1289d6181e	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 10:32:17.888
0e56812b-3d92-460f-82e5-f7e9d6ac29ae	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 10:34:33.243
de77d17e-74f3-4ae1-bec0-f989ce591061	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 10:34:35.762
c707c0b4-b6f3-4cf5-baac-5045316a72ba	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	desktop	Noida	India	2026-08-04 10:34:35.82
dd2ca407-2ca9-4de6-ae1f-80b17a3dbda8	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:34:36.067
56b0be63-71c3-4cc3-9c3f-705156a66673	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:41:18.353
61c507ba-d38d-440a-86a3-234199270b11	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:41:44.16
160ef014-b579-46aa-9e95-b722757dcdc8	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-08-04 10:41:44.165
b64948e6-3d60-4bad-890e-a8f0166bbbcc	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:41:44.162
242447cd-9b1f-49ad-8f8d-5127400a6205	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 10:43:39.772
1f84ee2b-3feb-4761-91c3-83a4f0227081	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:43:50.108
5dc7bea7-fd11-4653-a3ec-1bd65da3d45a	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	desktop	Noida	India	2026-08-04 10:43:50.109
23248578-af14-402f-b8f4-ac1d1183211e	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 10:43:50.11
804dac11-3413-4b82-bfcb-02964e469cba	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 10:45:56.769
4863133c-f421-459f-ad42-b0bae161a1bf	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 10:46:08.167
0ac6237b-81a5-4d84-96c5-fd5fbf109e71	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	Noida	India	2026-08-04 10:46:08.168
7c12c29b-cff9-4f80-9c20-30ba073c7b12	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 10:46:08.401
431d209f-2e6f-43b5-87b5-219ce63b5f64	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 10:50:48.302
dd3cfe16-dd6c-4d4b-b78c-30b6f1d05cf8	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	New Delhi	India	2026-08-04 10:50:51.522
0b7339a4-4eb2-47e7-98be-e2fe5653ca63	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	New Delhi	India	2026-08-04 10:50:51.578
f9d6e63f-63a8-4e25-99af-77c69cf3703c	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-04 10:50:51.633
587ecbc5-b64a-4427-a7ad-f631df89f706	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 10:53:12.814
2ffb12de-f055-43f1-8a8a-67ab43da6f54	product_card_click	/products	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 10:55:34.322
3f226566-764a-40c2-8ca5-fa9486bc71ba	product_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"productId": "348e50a4-14e3-4179-a873-38e305687fdd", "productName": "Premium PC Mattee", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 10:55:34.322
14461d27-0378-493e-a46b-5dab2d0d965f	page_view	/products/348e50a4-14e3-4179-a873-38e305687fdd	{"path": "/products/348e50a4-14e3-4179-a873-38e305687fdd"}	desktop	Noida	India	2026-08-04 10:55:34.324
f38ec7f4-ee7e-4d8d-b19f-472e4df618ae	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:06:28.354
7647ac35-b3d3-4406-9650-921a36130c69	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 11:06:33.478
6a717172-73dc-4aaa-84aa-75f393fc114b	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 11:06:33.474
d598ddc7-4d9f-402c-9285-60bc5a894f04	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:08:42.896
1795ccbc-d2c9-4e52-b192-1cea03966354	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 11:09:02.661
da8a7f87-d122-4279-a23a-b110596e74f8	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 11:09:02.662
f84f7728-4ae1-4c1d-9342-e3a39436e7e5	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	Noida	India	2026-08-04 11:09:02.664
d371f745-86ba-40fe-8efc-4dec9ac1aa69	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 11:11:48.973
c78e31f3-5288-4383-8068-d6946f4369de	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:12:08.937
5d6139e9-f7ae-4907-9749-2035ca719099	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	desktop	Noida	India	2026-08-04 11:12:08.938
c0aaf382-46de-475b-aa3b-32e0a9ebee0a	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:12:09.599
31b15535-8821-4d65-8053-af6512a2579d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 11:18:43.795
5144e7cc-1038-4aad-8195-b3d8b3283852	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 11:18:49.838
83c2844c-fac9-42bc-823e-c12bb6a872e7	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:18:49.995
d0757018-bc7a-4c22-a6be-b089f05bfcea	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	New Delhi	India	2026-08-04 11:18:50.051
0360d633-2159-4c9c-8422-534e21f601b1	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:21:23.546
5d651be7-0eb8-4eae-86a1-614b3dd861ad	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-04 11:21:26.443
62efa559-03ce-4208-b0a1-8af6cba45608	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-08-04 11:21:26.5
48c26e87-5cdc-4517-a8c0-01287bac8618	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	New Delhi	India	2026-08-04 11:21:27.673
9e00eb7a-3bdf-4d16-bc6b-f8db357dc190	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 11:25:08.096
2040c2ac-9793-4d32-a629-e6cbb4bc29fd	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 11:25:09.27
ea8d4637-756f-46b4-ab82-3a0bc8711ee4	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Noida	India	2026-08-04 11:25:09.374
969e223d-8e06-4688-8e1b-4e835c097de7	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 11:25:09.574
dbbdbff7-d004-496f-b100-913ed279a824	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:37:31.559
13610981-fbd7-4192-a3e3-366d740c9e2a	whatsapp_click	/	{"source": "hero"}	mobile	Patna	India	2026-08-04 11:37:39.953
ad63d6d5-a73a-4250-b48b-976978b176ca	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-08-04 11:37:57.561
f691bcd7-3d73-408c-a792-16db02aac8ac	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:38:17.841
61f7b353-7f4a-4e5c-86a9-9f308a6d4e1e	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Patna	India	2026-08-04 11:38:28.474
c11edae8-44ed-4bd5-baf2-3bdde8f5171c	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-08-04 11:38:28.48
aa17e3bd-5e03-4db3-972d-f92dab2a7c8d	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:38:39.842
24fc8bcb-c81e-4f97-acd6-e60210b0fbec	whatsapp_click	/	{"source": "hero"}	mobile	Patna	India	2026-08-04 11:38:48.167
1a5fbe68-2533-4981-bfa9-1919dd46e02c	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 11:38:55.195
43b53980-6135-4862-99f6-9592bcedc784	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:38:55.959
2660fb47-e46a-462e-9232-76877c996923	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	Noida	India	2026-08-04 11:38:56.062
38e14be1-b2b7-4436-a60b-f35d33ec50df	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:38:56.266
1de9c62d-8e8f-4c86-b0e8-74d6339d0a9e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:41:35.055
01a53656-88ef-4e71-b582-720d237ac6c9	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 11:41:35.719
0dbe2ee1-786f-41e0-95c2-d56492493004	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Noida	India	2026-08-04 11:41:35.76
244751a4-3c63-4f49-9995-458008607f3d	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-04 11:41:35.806
81f4a6e2-84f6-4ce0-ad74-9b920778a026	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:43:52.571
cd8f306c-a6d9-4a3e-9cf1-d4f76279e50a	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-08-04 11:44:01.978
e7ef1424-3433-499b-8a40-3c69e7138c4f	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:44:01.979
ae612e5d-c80f-4286-9910-d9b601177273	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-04 11:44:01.979
290fdbbd-9eea-4c1c-86d4-2784a2a7f63a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:46:10.91
f32b6e80-3e83-45e0-804c-8eaa10e6b9cd	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-04 11:46:11.367
2cb42ae9-aace-4ad5-ac15-3efdd6ebdd31	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Noida	India	2026-08-04 11:46:11.471
efc44449-0324-47be-a33c-5b7ebe7680a1	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:46:11.573
8908e3e9-de8d-45ab-8160-f0bb3bdcb658	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:47:44.976
0753967c-dd19-42ff-933a-ef49d875e82a	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Patna	India	2026-08-04 11:47:50.789
11419264-3f93-4967-b2d6-59ab349f6db9	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-08-04 11:47:50.799
40d15732-000a-43b3-a24d-3277814edb09	whatsapp_click	/products	{"source": "footer_strip"}	mobile	Patna	India	2026-08-04 11:48:01.741
c5d62bb4-816b-42fe-ae88-5e6b8951340f	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:48:11.29
bb6f80ec-a5a1-45ce-889e-5b48e31d75a7	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	mobile	Patna	India	2026-08-04 11:48:12.438
37c00de8-c913-46fe-8454-aa9f34ce9f02	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-08-04 11:48:12.532
e2458a26-f758-4661-ac07-235ba0b2c1f2	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:48:16.093
45c8309a-0914-4b72-8d74-ad796b361395	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	desktop	Noida	India	2026-08-04 11:48:17.626
7c45bb49-5316-44f8-9789-32054778cedb	product_card_click	/products	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 11:48:17.683
af6dd94b-18b0-4a0c-ba06-72e910c4c1cf	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 11:48:17.836
1e9f9882-4ac5-40f6-af87-125f4660b73e	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Patna	India	2026-08-04 11:48:18.571
604f3d14-3fdb-4581-8dcc-a52cce21990e	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Patna	India	2026-08-04 11:48:18.571
6cd92ae2-263c-4b76-a5fd-05348a0db004	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	mobile	Patna	India	2026-08-04 11:48:18.642
11b13895-392b-4588-a25b-629446d7da68	phone_click	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"source": "product_page"}	mobile	Patna	India	2026-08-04 11:49:07.145
3cccd36c-a014-482a-8462-e979084c84ca	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-08-04 11:49:37.877
7f7dec1f-7726-4753-bec6-2e2108598b49	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:49:38.989
aa315414-b62f-4f9a-94d2-d79af394631c	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Patna	India	2026-08-04 11:49:41.389
b80c66c3-a8fd-4cea-abe2-35bc30cb1690	page_view	/products	{"path": "/products"}	mobile	Patna	India	2026-08-04 11:49:41.447
5fab11ee-82b0-401b-adc7-b9c323303fa8	page_view	/	{"path": "/"}	mobile	Patna	India	2026-08-04 11:49:46.165
7ed24245-de1d-47b5-8a59-239db16a58a2	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-04 11:50:38.726
0e6f9585-53d6-4748-b161-401c51c6b729	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	New Delhi	India	2026-08-04 11:50:58.235
0d028369-32a4-4ee8-b11d-5134d91fda7a	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 11:50:58.338
565ca0a0-01b1-4869-a14e-ea98199cfdeb	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 11:50:58.338
78ed8a9f-776b-46f6-acb0-d8c12f532c28	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:52:55.503
0201f20d-dc16-42cd-a789-4e7cd4e340f8	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-04 11:52:57.168
028d4e08-237f-4722-bb8c-ddcab5db5b0a	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	Noida	India	2026-08-04 11:52:57.23
cbb8b241-97a5-4849-977e-b8664500de6a	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-04 11:52:57.269
f0653cff-b176-4e29-9664-31fb3c7583d4	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-04 11:56:11.087
59d68568-ab2e-40b7-a771-e66cebebda35	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-04 11:59:54.84
845ecb88-c1b5-407f-a303-9a5e5b963101	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-04 11:59:54.841
72610bc0-8f0a-4c1c-a845-8879a9896a8c	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 07:15:09.565
7df23457-d146-4de6-bb05-d511b016ecf3	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-04 11:59:54.936
a069e467-2438-4019-bd67-9f6a08f9c03f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-04 12:10:06.561
69909507-ab1d-4e0f-9feb-443013f6d835	page_view	/	{"path": "/"}	desktop	Delhi	India	2026-08-04 13:54:17.297
455f583d-841b-4202-9977-89b9d2da9d28	page_view	/	{"path": "/"}	mobile	Guwahati	India	2026-08-04 18:00:45.638
ed7817f2-7cad-4670-a389-72630e166f68	page_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"path": "/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048"}	mobile	Mountain View	United States	2026-08-04 18:50:58.754
af6f2473-b1fb-48f8-91a8-4ccdda8af8ac	product_view	/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048	{"productId": "7f54851a-dbdc-43a3-9bb5-d7b2b1225048", "productName": "Polo Unisex Premium Sports & Casual Wear", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-08-04 18:50:59.086
c68cbb00-081c-4978-8347-93b2518aa0fd	page_view	/	{"path": "/"}	desktop	Groningen	Netherlands	2026-08-05 02:43:23.644
b7e6b526-e0dc-4e21-8d3f-5cc8decdf6c8	page_view	/	{"path": "/"}	mobile	São Paulo	Brazil	2026-08-05 03:16:00.273
c8bbeed7-4dbd-4aa9-8f95-cadafd0aa686	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-05 04:21:05.797
00c76e17-c6dc-4184-ba16-a635d919fdf9	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-08-05 05:30:36.036
57e4896d-3764-4199-9a54-2012d41b26b4	page_view	/	{"path": "/"}	mobile	Hyderabad	India	2026-08-05 05:31:36.541
162e38c8-a708-4991-a55e-f34826837332	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-08-05 05:36:11.857
4358e9b3-7ee9-433f-89b5-e9469a8359f0	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Hyderabad	India	2026-08-05 05:36:20.726
588d038a-c34a-4556-ba61-f6ad3ffe539d	page_view	/products	{"path": "/products"}	desktop	Hyderabad	India	2026-08-05 05:36:20.764
78019523-a7f6-40b8-a6af-04381a778ce2	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	desktop	Hyderabad	India	2026-08-05 05:36:34.518
652b4c6d-8210-47c1-a3da-1769945d27c1	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	desktop	Hyderabad	India	2026-08-05 05:36:44.287
3547ceee-261c-4c08-8628-30d7a88889c0	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	desktop	Hyderabad	India	2026-08-05 05:36:49.038
d94066f3-6553-4f30-b0f6-96bf56389a91	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Hyderabad	India	2026-08-05 05:36:58.968
f64199f3-b38f-4806-b9c1-32743e79622f	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	Hyderabad	India	2026-08-05 05:36:58.994
545238ff-4e37-490d-a1d5-08125777bbf6	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	Hyderabad	India	2026-08-05 05:36:59.036
0f0c8bb1-c132-407a-bc4b-a5a94594b98f	page_view	/	{"path": "/"}	desktop	Lucknow	India	2026-08-05 06:06:56.089
031debc4-d5ed-49e6-a148-1613a18e1696	page_view	/products	{"path": "/products"}	desktop	Lucknow	India	2026-08-05 06:07:31.431
acb31f55-30ea-414b-a37a-361785a02a91	page_view	/products	{"path": "/products"}	desktop	Lucknow	India	2026-08-05 06:24:19.73
74b3d09f-ff00-44b4-9d4f-8895d70448ef	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	desktop	Lucknow	India	2026-08-05 06:24:25.448
fb8dc63c-e49c-4951-ab63-86b6d8e75dab	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Lucknow	India	2026-08-05 06:24:27.428
ef1041a7-e4f2-409f-81c3-5a919cc2daec	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Lucknow	India	2026-08-05 06:24:27.492
4d0ef6a5-b802-4c8f-a81d-a79930a008db	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Lucknow	India	2026-08-05 06:24:27.505
a4a618f8-e5ab-42b5-b6f2-058a3344ada6	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-05 07:36:22.218
9215718e-0cfc-456a-9051-999ae23ccdd1	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-05 08:55:38.557
ba2d4ee0-c9a5-4c0d-a8f7-d287ede416a1	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-05 08:55:44.001
cbe97a34-2487-4944-b8b2-eb62ac22f776	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	New Delhi	India	2026-08-05 08:56:10.502
43c3f3a5-47b4-44cb-98ce-53320361b95d	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	New Delhi	India	2026-08-05 08:56:16.837
a04557b7-d52a-4f1e-9f11-d012212c554e	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 08:56:53.452
50e4cbdb-2146-4c53-b5ba-8ffa1bf65c73	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 08:56:53.497
4afbfbe0-8285-44dc-84c8-7c7c8cdae9be	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 08:56:53.514
65d8180c-f119-40e3-9eca-e968da633730	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 08:58:59.968
32069157-e0e5-4d57-8904-e8a612cb1011	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 08:59:00.044
aeb8edd1-4f04-4128-ae56-00abb94a67a1	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 09:47:13.768
91bdd0c3-4c74-46fc-b523-23a5b6806181	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 09:47:13.827
ea46ece9-2650-480d-b3c6-f4dfd0848b03	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 09:53:54.723
043fb26c-fd67-4406-b91a-12131aec1daf	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 09:53:55.252
f4befbc8-38f8-429d-acd6-de2b556c9481	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 09:57:51.695
4ce7f063-9c79-4157-899b-d9103f01c8d4	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 09:57:51.763
575094cb-ab19-41ee-9c87-cd014e2b7322	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 10:00:05.124
467c323f-7eac-4fb8-91c7-8b65f02fd0c7	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 10:00:05.187
f4874fa2-a92b-4504-b436-53c4b1f4655b	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-05 10:00:08.974
d44e6e06-31d2-4c35-9f1d-d260d1c27100	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-05 10:00:11.61
f20eeee6-0322-4b71-8e9b-f77cb8ef8a65	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	New Delhi	India	2026-08-05 10:00:13.019
dcff756d-6468-4598-ba82-552ff46b69d6	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 10:00:55.565
7271e781-355a-44c6-9eb2-b154a096f947	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 10:00:55.57
0b2d99e7-2c81-4c94-99b4-d383559d4616	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	mobile	New Delhi	India	2026-08-05 10:00:55.579
e8a4d960-7eb1-4a2a-9eb1-2e10e02abbe1	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-05 10:01:08.034
f6d405c8-f71a-4d5a-91d1-b04f14faae08	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-05 10:06:11.526
a4dda4dc-c08f-4d25-a5d4-9b03f81958f8	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-05 10:06:27.659
41808f41-8174-48fc-aaf8-66e4ad9b273e	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-05 11:24:04.618
a99c9f68-8e8d-4861-a266-b7f04ec10ecd	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-05 11:24:11.202
8ce259a6-46a7-4d54-a563-0aab76fb74ca	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-05 11:24:11.205
f0c2de2c-5f9e-40a9-9325-b87e0bfd0427	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-05 12:43:32.121
c75f44a6-03ef-46d2-9ea1-bc23788608ba	page_view	/	{"path": "/"}	mobile	Goh	India	2026-08-06 01:55:55.588
355d411e-0a7c-4972-9a39-b377b554d1d0	page_view	/products	{"path": "/products"}	mobile	Goh	India	2026-08-06 01:56:13.617
e35f2907-eeae-47cb-8d21-07637307a291	page_view	/	{"path": "/"}	mobile	Goh	India	2026-08-06 01:56:27.455
85d2a387-fefc-4782-8a3a-4662f21650da	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-08-06 02:34:53.73
7dfb2e64-711d-43b0-8181-2480d861c6e8	page_view	/	{"path": "/"}	mobile	Noida	India	2026-08-06 03:34:58.877
04303719-ae0a-4484-857a-5cef987b8faf	product_card_click	/	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	Noida	India	2026-08-06 03:35:07.59
e1dd901f-f318-4a2e-8db1-1af6d7a1a2b7	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	mobile	Noida	India	2026-08-06 03:35:07.625
b44a3806-abc3-415e-8140-be74b593cd15	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	Noida	India	2026-08-06 03:35:07.625
d91e453a-f4dd-48de-b1b5-10d7d1f05dc3	page_view	/	{"path": "/"}	mobile	Noida	India	2026-08-06 03:35:14.095
8c4941d3-18a7-4322-95e1-5d92292c4dfb	page_view	/	{"path": "/"}	desktop	Reston	United States	2026-08-06 03:38:49.392
e5e2afb3-8bda-43b0-904b-06d75c32ba9d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-06 04:20:36.45
7000307a-eaf4-4368-a9f3-e88a5d91b4ce	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-06 07:16:52.025
a4bcf3ba-49bf-48b9-a0ad-eaac1060932a	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-06 07:16:54.488
8f6f9c2a-8963-4e03-8be2-4584c87d80b4	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-06 07:17:35.221
23b442f7-e2d7-4af9-a6cd-d94b72ac03b2	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	New Delhi	India	2026-08-06 07:17:35.226
2a4584f5-c9c6-4148-a3e5-785c2c6b2f95	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-06 07:17:35.236
65c34ad3-c3a6-4eee-932b-cdcecab3c289	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-06 07:18:03.089
902d5ac0-d184-4afe-81a0-a0097fc06bcb	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-06 07:18:04.998
d6b23cc0-672f-4742-9bb8-017d1f018524	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-06 07:18:12.68
fd28458d-6406-4a4e-bac2-d93c5ed5fedf	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	New Delhi	India	2026-08-06 07:18:12.69
7269d216-937b-46a2-9d68-b93f9201e59c	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-06 07:18:12.724
3e3ee9a1-fda2-461b-a47d-39cfd71701b0	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-06 07:18:33.03
6f53d38a-1ed8-4dd3-9edc-94f9863b8542	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-06 07:18:37.652
95f1b14d-bb80-49bd-9fab-c4949d5a1d82	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	New Delhi	India	2026-08-06 07:18:37.666
e9554036-01cb-452d-820b-c28cf45db75d	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-06 07:18:37.722
ec704866-f300-444a-b8ce-76d30b4f3dc8	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-06 08:45:29.394
92653ddb-d69f-4cb3-a01d-a4ba3fea9dee	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-06 08:45:29.399
c9c1e2f2-255e-4a4d-adf1-ea5c4f6c79a4	page_view	/	{"path": "/"}	tablet	Hyderabad	India	2026-08-06 09:46:59.396
d918cc98-0dce-4e3e-9f57-6d6f270f73a7	product_card_click	/	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	tablet	Hyderabad	India	2026-08-06 09:47:20.105
95a43dc4-a7e6-47d2-8829-f11f395aba46	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	tablet	Hyderabad	India	2026-08-06 09:47:20.109
b32b4e75-93bb-4a2a-8862-6ad4372c4512	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	tablet	Hyderabad	India	2026-08-06 09:47:20.11
92ac893c-8088-48f8-96f1-a968b5bd0c46	page_view	/	{"path": "/"}	tablet	Hyderabad	India	2026-08-06 09:47:23.679
72f01e53-b9e4-48d4-a5ba-6e2d16b6aa9d	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	New Delhi	India	2026-08-06 12:04:54.148
21348cd9-3e17-46a0-9f95-845b543a7505	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-06 12:04:54.168
8008c272-2aa9-4d48-af9a-d8e45cb3e328	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-06 12:04:56.609
9ae5b9c7-c8f4-4a7c-a0f0-b0d66c9078f5	page_view	/products	{"path": "/products"}	desktop	Pune	India	2026-08-06 12:05:06.667
e6d77ff5-9ea1-42ca-a05d-205ddfbf112d	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-06 12:05:13.261
208db7c7-458a-459a-b87f-6945bd3318e4	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	New Delhi	India	2026-08-06 12:05:13.278
2ca3d593-9780-4bc0-89df-6a9bd146e82a	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-06 12:05:13.282
07c76f7c-6714-4647-8c0f-5b0bb4e48347	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-06 12:13:34.854
cdb05371-ef40-4abf-91e0-48cdb6695293	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-06 12:13:45.881
9c354161-3805-4364-bdd8-17a5e1a9ee31	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-06 12:13:45.89
09ef1d02-8b85-4ae5-a032-4bf517e3d65d	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-06 12:13:45.903
b1d190c1-31f1-4b67-a349-590efcaf8bdb	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-08-06 12:36:25.338
187cdb74-5e1b-42ce-9293-e2905018a961	page_view	/products	{"path": "/products"}	mobile	Delhi	India	2026-08-06 12:36:29.158
a5747080-23e9-4b5e-b8d4-74a8f05683b6	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	Delhi	India	2026-08-06 12:36:33.964
31a01477-b24c-42ff-97cf-075a53a91c40	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	mobile	Delhi	India	2026-08-06 12:36:53.254
d8e1f0bc-1ae4-4c90-b520-91063500818d	filter_applied	/products	{"value": "1", "filterType": "minGsm"}	mobile	Delhi	India	2026-08-06 12:36:56.27
c3924fcc-9e55-4188-b843-333ad9b96d7b	filter_applied	/products	{"value": "18", "filterType": "minGsm"}	mobile	Delhi	India	2026-08-06 12:36:56.36
0d32883f-2b5a-4e11-8af1-9a6831fc8e69	filter_applied	/products	{"value": "180", "filterType": "minGsm"}	mobile	Delhi	India	2026-08-06 12:36:56.538
aa87dceb-22c7-451d-8af6-763446f03a20	filter_applied	/products	{"value": "2", "filterType": "maxGsm"}	mobile	Delhi	India	2026-08-06 12:36:57.758
8c1bfb44-2b58-48ed-8228-dc752361a7f1	filter_applied	/products	{"value": "22", "filterType": "maxGsm"}	mobile	Delhi	India	2026-08-06 12:36:57.889
1f0452e5-0e23-44d2-99a1-a71543cfa8fd	filter_applied	/products	{"value": "220", "filterType": "maxGsm"}	mobile	Delhi	India	2026-08-06 12:36:58.185
a36a6558-c268-4642-9697-7a6b2ec9359a	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	mobile	Delhi	India	2026-08-06 12:37:34.924
3842a1d0-5eec-4c29-9bae-b59864901855	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	mobile	Delhi	India	2026-08-06 12:37:34.961
dda26215-393f-48fb-89ed-4f1a38684ccf	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	mobile	Delhi	India	2026-08-06 12:37:34.962
98046fd1-b71e-48b9-8c04-7b0a4c4a40e4	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-06 12:40:58.275
65f09f27-a699-48ca-9fd3-c615b59f0ce4	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-06 12:41:19.883
3013416e-867b-44a5-8089-174efd352c47	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	New Delhi	India	2026-08-06 12:41:19.888
679af248-8682-4fc0-8d9c-710718c95520	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 07:15:38.683
4bc7e945-675a-4370-997d-3aad798ea5d3	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-06 12:41:19.896
741bac4e-2d66-4bad-868d-ed98f81fe31d	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-06 13:08:38.675
ced4aa09-e734-423b-91db-616fd1bca2ac	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-06 13:08:38.697
62fee153-22ba-47aa-a84b-9b5f99dade58	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-06 15:50:18.149
ac26a15f-c1b1-4359-80bb-c097c2f341b3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-06 15:50:25.234
0d300b7c-388d-42b1-bcbc-a96b02c16201	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-06 16:12:31.581
2a79587f-8474-4005-bea8-cc225ccf9779	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-06 16:12:31.605
69c02ff2-145a-4962-ae3f-7b6bedb8b3c9	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-06 17:02:48.557
23657e17-8fde-4b1b-ab52-e3a4ef729f91	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-06 17:03:00.321
555ac748-f912-4998-a34a-5cdc36c9f2bf	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-06 17:03:00.335
b709dd0e-8710-4e7d-8628-7ad7c073ec2c	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	New Delhi	India	2026-08-06 17:03:28.569
0dca5b9f-0474-4734-b844-ee491e715845	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-06 17:03:28.571
24e547d6-5460-4dca-8ea3-ebf2e5e2eb7a	product_card_click	/products	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-06 17:03:28.577
ca5846cc-222e-4001-a676-e25d8092ce1f	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-06 17:03:40.093
efb3644b-00ee-4952-8f71-dbc76a4b7be5	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-06 17:03:44.576
019747a4-ce89-43ec-9863-1fd7b4051d43	page_view	/	{"path": "/"}	mobile	Nagpur	India	2026-08-06 17:26:40.377
0c0623f2-6b4c-41be-ab1b-10f354312366	page_view	/products	{"path": "/products"}	mobile	Nagpur	India	2026-08-06 17:27:12.568
2cd28a50-055f-425a-bd1c-002a46b8de13	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Nagpur	India	2026-08-06 17:27:14.476
801fb300-f5f2-43c4-a2c1-227c4f2cc9c9	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	Nagpur	India	2026-08-06 17:27:14.566
b5df3d01-2f04-454b-9a42-addaf1b7c7f7	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	Nagpur	India	2026-08-06 17:27:14.567
0c116675-35d4-44f4-81a6-53157eab7b93	page_view	/products	{"path": "/products"}	mobile	Nagpur	India	2026-08-06 17:27:16.441
115ce3d9-eda7-4060-9dc0-6a67abca9304	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Nagpur	India	2026-08-06 17:27:34.609
0ff790b2-246a-4468-936c-84445f314c14	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Nagpur	India	2026-08-06 17:27:34.627
a3a08b76-c6c2-44f0-b5da-5c833cd6044c	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	Nagpur	India	2026-08-06 17:27:34.63
b7dd915d-0233-4408-91f3-a65b1e6f7f28	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	Nagpur	India	2026-08-06 17:28:24.948
319be006-27c5-4e3e-9356-694d9fdf0eb0	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	Nagpur	India	2026-08-06 17:28:24.96
a9c35e08-20c8-47ab-b7e6-c6f555df29ad	page_view	/products	{"path": "/products"}	mobile	Nagpur	India	2026-08-06 17:28:25.611
15a130c6-ddf4-458f-a652-7a53a7cca1d4	page_view	/	{"path": "/"}	mobile	Nagpur	India	2026-08-06 17:28:26.672
e1b86f2c-6fae-4598-a1d0-da19995928ca	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:16.964
f6025287-37d0-43ae-9c4b-c9a5b5131f93	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:20.485
d42497f5-6013-4251-b2f4-aa1dd5e8a2a6	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:25.032
af094d76-2449-4d58-a1e7-099be9269158	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:30.006
988867ed-8baa-4eeb-974f-0949a01f3766	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:40.227
029e4ff4-658d-43e1-875b-201f3a78a4ad	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:50.975
e3627004-4fcf-42cd-9213-5f1a5b24ac24	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:51.087
5ae3474a-6483-493c-a1d1-8065fae21c7d	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-07 02:03:54.273
51c4ca29-84f9-4666-90ac-1c9fb3f8f217	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	mobile	Delhi	India	2026-08-07 12:19:38.799
4aefa268-3572-4614-98bd-48b90cc90e51	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	mobile	Delhi	India	2026-08-07 12:19:38.839
71506b28-1874-4fa5-a325-6c995219a9e0	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-07 12:59:27.647
36cea6f0-92e5-45ce-8a27-8045403571c1	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-07 13:38:03.141
84bdd160-b88d-465f-b299-d7e130a6a753	page_view	/	{"path": "/"}	tablet	Council Bluffs	United States	2026-08-07 18:46:08.19
a262ed41-a58f-485b-83d7-f4ba9d623513	page_view	/	{"path": "/"}	desktop	Santa Clara	United States	2026-08-07 21:58:21.543
80bfa1ce-1746-4523-a0f5-b0598caccf22	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-08 07:14:34.631
0ae0b18c-68db-40b9-8797-aeaab7392e5e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-08 07:17:32.847
b8dc141a-cc2c-4f29-8958-921f7de2b6be	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 07:19:42.844
b5d0d8d9-049a-4b0a-8c98-c2c8e5407f0d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 07:19:53.724
b5329a00-9463-4664-8221-dec4dc6eafeb	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 07:20:08.262
e027b16a-fca1-4a99-afc7-bb631863e268	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 07:20:08.272
ff006326-345f-4fbc-aaee-648e0b5faf77	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-08 07:20:08.264
e9157b89-a186-44dc-af30-1d5bc3d13a06	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 07:21:15.988
35ea660a-f917-4ea7-bf77-fa6c46eb7956	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 07:21:50.228
c510ef4b-3319-4772-9b97-c66972c80c4a	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-08 07:21:50.232
bf725f36-2861-465d-82a8-2fec8cfc93cb	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 07:21:50.242
41ed69bc-1013-4c86-aa68-0c40e75193da	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 07:52:35.795
7262474d-f452-4fb4-adc3-36e27b3e24e9	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 07:52:39.963
dd96dad0-091c-4f9f-99f5-a67223562b77	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 07:52:50.945
d0b27de4-4ab8-4121-b0d3-9ac543b7a85a	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-08 07:52:50.961
20f680d2-a2f3-4a71-a55c-08747eb30547	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 07:52:50.971
4cd8ce55-e476-4418-bedb-419544e71c95	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 08:04:57.94
f89aedab-c3e1-4e69-94a0-e52dcdb239a6	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 08:05:00.33
a402c5ef-399c-488f-8d8d-2613fa265e66	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:05:03.778
8b7cee32-04b2-48a0-9e67-35fe4fa46869	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-08 08:05:03.834
8a7643bf-83aa-4c60-8d80-751ea8241e71	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:05:03.85
9333b5ce-5e63-4730-99bf-c648bf19b5a7	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 08:05:27.358
2f6c813f-4f2e-4e05-9b09-80ae4d7870bf	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 08:05:28.622
0395eeb5-36eb-4619-ab28-9ed132c428f3	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 08:08:03.914
90aa6027-0883-4bd6-a060-1f6e64d57894	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 08:08:08.653
ba9f6320-5387-49f2-ac38-31c2924ffa20	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:08:53.995
a3bca544-78dd-45f9-a73c-56be11f8a9be	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	New Delhi	India	2026-08-08 08:08:54.008
87350c3e-bd47-4b07-9207-3ed3aaeabdb6	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:08:54.02
c06c9d82-8efb-4c98-8dd2-f045a3106bfc	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 08:10:03.479
7fabab12-f397-48a2-a9c3-588f7b4ee5f1	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 08:10:12.743
86970a92-c9f4-4e9c-a072-d7f1d2ac761c	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:10:27.409
800f630f-c54e-4362-8675-9fc8cca6c827	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	New Delhi	India	2026-08-08 08:10:27.421
cbf0ea99-176b-4c32-8629-2590d8f9d1cf	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:10:27.431
97cb68c7-4895-41f7-b174-2353049b6e9c	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 08:12:37.235
35cdc91e-77a3-407b-baca-e1f1b1ca5761	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 08:12:56.107
f69c9733-6a1e-4636-b217-7af57bc822bb	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:13:32.254
0c6ac5ce-94e1-48a3-afdc-4d0ba61ee028	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	New Delhi	India	2026-08-08 08:13:32.263
5f2b82ef-88c5-45a1-9c20-b55af8baa407	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-08 08:13:32.271
c480687c-11ab-41d5-ba63-5cbc24e9a794	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-08 08:59:08.835
9a5030bf-410b-4200-a4d8-9df79b136c25	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-08 08:59:09.815
d778d5c0-39ca-4600-9d2e-4538be382a30	page_view	/	{"path": "/"}	tablet	Mountain View	United States	2026-08-08 11:12:57.766
e1d1505c-cb48-4613-85dc-e28ba19999cd	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-08 11:13:16.961
f8e43605-4da2-43a9-af66-4ca55e51623b	page_view	/	{"path": "/"}	desktop	City of London	United Kingdom	2026-08-08 14:08:48.094
3da4baa7-4ad6-4122-b6cb-5c226e89111a	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	City of London	United Kingdom	2026-08-08 14:08:50.646
83d68412-f828-4b70-86a5-c7a5e84d5250	page_view	/products	{"path": "/products"}	desktop	City of London	United Kingdom	2026-08-08 14:08:50.731
46e39c1c-7a38-4fca-b6ee-131e16f65ce1	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-08-09 12:03:03.571
294df96f-d78f-4131-8cf9-7f1a5a12c581	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-09 13:55:56.342
340e7445-f0e4-45eb-bfc6-3907660173cd	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-09 13:56:04.059
53761af1-c21a-448a-95c9-48b61a636f5e	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-09 13:56:04.059
3e201165-1b95-4fd6-8a9e-5ed6502b3669	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-09 13:56:31.804
5e54da29-d9f2-41d7-9509-18e7ae3187c3	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-10 09:16:00.857
7d2e6927-eeae-4d1f-a33f-13e8925cd4b1	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 10:51:07.513
cc14d51c-3ef5-4c0a-8897-1710228c616b	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:14.996
9640f76a-c168-41a1-829d-51ef3425be31	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 10:51:15.023
81f14c24-ecbe-4db0-9a47-cdf7bb27b910	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:22.809
50c30c1a-5750-4893-b348-cadcf60b19d6	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	New Delhi	India	2026-08-10 10:51:22.81
a7b318e2-8531-4660-bad0-978ccae59900	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:22.832
320e984c-8382-407b-a13a-ffa6f6079e25	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 10:51:27.743
715017f4-44c3-413c-ae3b-f639fd7d4dfd	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:31.383
59738396-f1e4-4cc2-86ef-f827b1dbdd66	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	New Delhi	India	2026-08-10 10:51:31.445
550aab79-657f-4fa1-81fd-25ece47c4f4f	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:31.448
f71d1f47-19ff-4917-a8ab-b2554c2b3b72	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 10:51:37.506
6a118ab0-1701-4da2-a27f-e77c44725e0a	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	mobile	New Delhi	India	2026-08-10 10:51:43.091
c0c96a15-17fb-45fc-9c2a-e4116994aadc	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:43.093
232e4952-1133-412f-b547-55aa41458dd3	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:51:43.112
a25ca323-5f18-47af-bbc2-d158ea73a5b0	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 10:52:09.365
a630660a-5f38-4304-8643-a1f90b9b02e0	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:52:13.337
bb717782-013f-4c63-8645-8fe8c98acad7	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-10 10:52:13.4
013a755a-004a-4564-962d-709fee3e15a0	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-10 10:52:13.422
09626f56-c631-4074-b50a-3a6cb39047b2	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 10:52:34.73
9a219031-6fdb-469f-8aeb-bd50a4a3e15a	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 11:32:37.29
b957f225-316a-4a1f-95cf-76b62dec061c	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 11:32:56.447
b138b0d7-a22c-4d8a-89a2-61ada9e1a895	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 11:33:11.846
ba3a7f1b-66b3-44a8-b828-a6c3886a3afa	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:33:32.375
951f96fc-d9b7-4a5f-9b4a-51bc32fdab8d	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	New Delhi	India	2026-08-10 11:33:32.389
6909f23e-16b2-47e1-9965-06c9c24634aa	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:33:32.41
787a326a-625c-49ad-816f-feb17aedf277	whatsapp_click	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"total": 5000, "source": "product_page", "quantity": 50, "productName": "Round Neck 113", "pricePerUnit": 100}	mobile	New Delhi	India	2026-08-10 11:33:36.042
21d42abd-9a22-49fc-91fb-519fe52281f4	whatsapp_click	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"total": 5000, "source": "product_page", "quantity": 50, "productName": "Round Neck 113", "pricePerUnit": 100}	mobile	New Delhi	India	2026-08-10 11:33:57.402
70191cde-9ed9-4a59-a831-8c77e0e493c0	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	New Delhi	India	2026-08-10 11:34:38.824
b1bd3d74-a842-469a-a5e5-2f8f2a4ecf10	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:34:38.847
35136e80-c9e7-4d56-b674-eeb074a4fd7e	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-11 05:29:38.824
07915cd1-94dd-44d5-a296-260c16bf4d0e	phone_click	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"source": "product_page"}	mobile	New Delhi	India	2026-08-10 11:34:47.557
a2e95725-8b8e-45ef-84ba-073512eb89b3	phone_click	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"source": "product_page"}	mobile	New Delhi	India	2026-08-10 11:34:58.892
f8e417aa-a982-46c1-80d0-356ad95c2516	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:35:10.592
f914d21f-96c0-447b-b10c-5b2ada1f280e	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	New Delhi	India	2026-08-10 11:35:10.594
15b325da-1805-448b-901c-7dcfd78517b6	whatsapp_click	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"total": 5000, "source": "product_page", "quantity": 50, "productName": "Round Neck 113", "pricePerUnit": 100}	mobile	New Delhi	India	2026-08-10 11:35:12.26
2f80185a-7f3d-43e9-b974-99b20be5fc88	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:35:24.023
62df8d4f-b3a0-416d-9b85-c106baa57dda	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	mobile	New Delhi	India	2026-08-10 11:35:24.03
e35b1b3f-90e7-48ea-8a67-bef4ec15b623	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 11:35:29.987
d0bdeb6b-6337-4fa8-aa0b-2346e149dfe5	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 11:35:37.797
a8f5400b-304d-4636-a20e-ad2bfaad98df	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-10 11:35:50.739
230e99c0-7ea9-4823-b9a0-782fc6d7b1be	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	mobile	New Delhi	India	2026-08-10 11:35:50.742
3557ccf3-dba4-487a-a382-752b3ffb0528	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-10 11:35:50.777
72d1b113-bf0c-4b0e-b1b7-2b7c0c2094b2	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 11:36:06.727
f6b26ce9-e1d5-4d71-b953-be8c92b7a1a2	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	New Delhi	India	2026-08-10 11:36:31.378
eca711df-2a52-45f2-bd40-502992072b8c	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	New Delhi	India	2026-08-10 11:36:36.494
ed705f65-47d9-42d0-b3ff-e9c3539cb239	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	New Delhi	India	2026-08-10 11:36:44.576
638e21fb-e689-47ef-a23d-ced1c5076145	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	mobile	New Delhi	India	2026-08-10 11:36:44.609
83c76a8d-446b-4d9b-89a2-943c26b9d3e9	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	mobile	New Delhi	India	2026-08-10 11:36:44.62
e0bdcfc4-5e12-4081-b14f-28c3917f46e8	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 11:36:49.398
83fe900c-322f-46b5-bc84-de85fbdc2903	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 11:36:52.531
2ed309aa-776d-4c53-a15f-1e22059f01f6	product_card_click	/	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:36:54.687
8ceb2ef9-7f71-498f-8e17-08cddb875087	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	mobile	New Delhi	India	2026-08-10 11:36:54.747
6aa3fde0-8de9-4cda-97e7-191bbcecd0c6	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-10 11:36:54.786
631f7e39-3d41-43e8-b8ae-a443a779265b	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 11:36:57.899
4b428277-d123-4b68-8249-6bb333664ebb	product_card_click	/products	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-10 11:37:01.128
3d872a87-084b-4a3c-a2a9-2340c08072ab	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	mobile	New Delhi	India	2026-08-10 11:37:01.302
34708bad-f6b4-4022-b01c-993fac60f608	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-10 11:37:01.515
52ae26de-49f9-4ee5-bd0c-07cb369850df	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-08-10 11:37:03.34
3c185d84-2a5f-4f2d-bcf9-e519535de586	whatsapp_click	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"total": 14000, "source": "product_page", "quantity": 50, "productName": "GIFT SET", "pricePerUnit": 280}	mobile	New Delhi	India	2026-08-10 11:37:04.593
f7df32e3-1a5b-4040-9cb9-b3ded018bd6c	phone_click	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"source": "product_page"}	mobile	New Delhi	India	2026-08-10 11:37:12.512
011de0c9-0cb9-450a-97c6-0d51632029ae	whatsapp_click	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"total": 14000, "source": "product_page", "quantity": 50, "productName": "GIFT SET", "pricePerUnit": 280}	mobile	New Delhi	India	2026-08-10 11:37:18.248
86e1b358-2537-4413-b20d-7d18ae9763d4	phone_click	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"source": "product_page"}	mobile	New Delhi	India	2026-08-10 11:37:42.97
f7c40aa9-3e54-4dfa-b33a-f158eda4915e	phone_click	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"source": "product_page"}	mobile	New Delhi	India	2026-08-10 11:37:51.408
6ea32953-ef29-4a23-83d4-638afa245ab5	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 11:38:25.972
b16052c2-2387-492e-befd-7b82f8f841a2	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-10 11:38:33.235
0fd64fb9-8462-4706-aa6a-6b931e054bff	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-10 11:50:39.252
abcae62a-82cb-4ba4-a948-6289bf11129f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-10 11:51:04.817
cabd6184-abef-4909-9d98-e65cd4d7ee9b	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Noida	India	2026-08-10 11:51:13.202
93d34524-dc39-4a09-9ad8-bbc1d70e0a65	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-10 14:20:20.746
77e93812-9e2b-4428-80d5-6427cdb4c459	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 05:43:15.439
8ed91819-a027-4148-a863-e1b82455294d	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 05:43:18.045
ba4e2f30-5df3-44d6-b367-b0059cd75151	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 05:43:18.107
82bfb4c0-d248-45a2-85a9-644f51dd04a8	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	New Delhi	India	2026-08-11 05:43:18.119
c08113fc-7507-4798-8fac-9a3efeab4850	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 05:48:49.971
ed8c53ad-816d-4e0a-bdb8-23f37442e5da	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 05:49:51.653
4b78794b-6c02-4485-8cba-494c3542a437	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	New Delhi	India	2026-08-11 05:49:51.657
bd5d25a9-fdf8-4322-9f22-91e5416482dd	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 05:49:51.66
e18da026-3576-4268-b2d9-e703e2fe8d1d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 05:53:04.695
e771c169-5911-4261-aae1-f6121f640924	product_card_click	/products	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 05:53:11.939
7ccff512-5002-432c-bfa2-b039ab48c9ca	page_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"path": "/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef"}	desktop	New Delhi	India	2026-08-11 05:53:11.961
1f130c63-667d-4d9e-87a1-e67702d80581	product_view	/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef	{"productId": "b3189385-9ff5-47db-b2f7-a0e2f62599ef", "productName": "Round Neck 117", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 05:53:11.966
c88a5c70-af41-44bb-9b73-474fa1c8d486	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-11 05:54:19.329
296598eb-6d98-4dcc-800f-433e90bb0d5f	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:07:14.477
22096904-f017-4eda-8280-31f699931177	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:07:17.143
f4884d25-8589-4716-9dec-0006004a3921	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	New Delhi	India	2026-08-11 07:07:17.217
7e2323c5-cf7c-4d0d-ba98-5c51ad6c92b4	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:07:17.257
c9f14b9f-380c-4821-9c5e-6f18ba4fb7ce	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:08:23.63
36b24509-02e7-45ec-8e19-7d66aaa509f9	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:08:35.502
498f8aba-3930-4036-9b2d-4a952abe80cf	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	New Delhi	India	2026-08-11 07:08:35.509
ae7def6a-0afe-4e66-b9b1-9bf1a8a03c02	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:08:35.518
dffce971-9389-4ca7-9164-ab8dd2ef6cd8	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:09:25.655
8a6e2dde-a874-4d46-a93b-5e206091f8ee	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:09:28.235
8e1b0e6e-7995-4892-a5d2-5a05f9d24e7b	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	New Delhi	India	2026-08-11 07:09:28.292
d3426925-5c88-42ce-9896-8bfc4ee73ed7	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:09:28.341
364059dc-7d92-4359-82c8-d6e5d9f93df3	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:10:54.751
3b097788-e3d2-487d-88b7-1543c9d84ac9	product_card_click	/products	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:11:07.984
1bb29f87-d06b-42d9-993a-21a71f3c4dd9	product_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"productId": "0b38413f-5524-4478-bdf6-83f25eff1427", "productName": "Premium Micro Polo", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-11 07:11:07.993
7671dce1-0c01-4bd1-b275-084a1df7c011	page_view	/products/0b38413f-5524-4478-bdf6-83f25eff1427	{"path": "/products/0b38413f-5524-4478-bdf6-83f25eff1427"}	desktop	New Delhi	India	2026-08-11 07:11:07.986
be3c1d10-3d2b-4806-b8fc-c66b8f4792c8	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:12:25.066
4be34219-2b03-4797-bb6e-069c9910b2ec	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:12:29.73
87b17d8a-d06a-4d88-8983-8fca718015fd	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	desktop	New Delhi	India	2026-08-11 07:12:29.737
e664add1-3ad3-4643-a280-4cd800e6eac6	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:12:29.779
ea5a7360-36e5-4e05-a961-92af0d6240f9	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:13:11.44
3f6e37a9-1be0-4cc4-b47e-92167d539fdc	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:13:26.696
6cd393e7-499e-4642-92da-68c505ce2fe6	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	desktop	New Delhi	India	2026-08-11 07:13:26.728
a5c7379b-c2bb-4f67-bb1b-249a1a068249	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:13:26.731
f3c04c17-8cc4-46ae-9f18-92b9f60f9c7d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:15:28.605
9a8b7ba6-d076-45a6-b0e6-ae13f460b514	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:15:38.34
2a6d1e18-19c0-43cb-81d7-64ea2e772ec9	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	desktop	New Delhi	India	2026-08-11 07:15:38.356
8ca49f0b-5a0a-4861-ad22-7338f7b170d8	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:15:38.365
d1b5ffd7-818d-454a-8615-59de05458515	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:16:29.18
4d64268b-be30-4101-b255-112e7229c35b	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:16:31.989
e7520c40-45e6-4706-9c79-e09fd10eb9ff	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:16:32.075
e615b969-5064-424e-9aea-9cca1e734b3c	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-08-11 07:16:32.076
8990c694-00af-49cf-86e1-9fb3bd2d052d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:17:26.245
d9957e0b-b8e5-4ffe-8392-3e57a2584337	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:17:48.024
dabf4488-23fd-4f2d-9bb4-0c4ce46f3c25	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	desktop	New Delhi	India	2026-08-11 07:17:48.035
11a19398-11bb-4a3a-bb09-7fa11712377e	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:17:48.045
7599c720-19de-467b-bb44-b3664b0105f1	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:19:47.452
a954c719-2a73-4f7d-b957-4b2fd654c82b	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:19:50.723
06830427-e356-4d8b-87b7-6f5a85fe48ca	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-11 07:19:50.801
a780804b-5a42-4758-9089-6f90debd8291	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:19:50.844
14de7f6a-ee7b-4e85-8e6a-d14d23b22695	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 07:21:00.351
12bf5a68-28fa-4dac-b19a-4492b73dc40f	product_card_click	/products	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:21:08.546
2081c6d4-436e-4981-bb63-097c0363db4e	page_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"path": "/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71"}	desktop	New Delhi	India	2026-08-11 07:21:08.557
59d9bf02-8ef2-435a-b5db-fcbb62e48358	product_view	/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71	{"productId": "a1d9ba42-6745-4613-a8a1-c763ef9bbc71", "productName": "College Batch Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-11 07:21:08.565
7b38bdd1-57c7-4994-a77a-4cbea80c4506	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-11 09:09:37.991
53993a98-07cb-41c6-8644-2582a2013a27	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-11 09:09:40.968
5facc5eb-13be-4aaf-a92a-1dbde4cabc38	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-11 09:09:56.563
68a2c767-93b2-4b3d-88c4-432fc1dab220	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	mobile	Gurugram	India	2026-08-11 09:09:57.588
a6018443-f526-49a9-b242-4aca2f0efe90	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-11 09:09:57.652
5b2e4bf8-03d1-40e3-80c5-b272f1ff8241	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-11 09:11:03.1
b8f4238b-f982-4a09-9a5f-b18f9578da83	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-11 09:33:59.012
f3e1f270-a0f4-42e5-aea0-4d29cb56a71b	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-11 09:33:59.022
7c4e2745-b5c0-4e89-aa16-ec38920aaf61	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-11 09:34:11.685
22c27401-139a-40c8-9cd7-f41443c5d96d	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	mobile	Gurugram	India	2026-08-11 09:34:11.693
972688f0-1483-4e2b-bd33-def1337beee5	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-11 09:34:11.719
5d9f467f-9ec5-4da8-9b1b-2fa6bd35182d	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-11 09:34:36.433
44338374-6de4-45d4-a5fa-bd0d49317c28	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-11 09:34:36.679
8f5f3b7b-6aa9-4121-b878-3705b2a68ac4	whatsapp_click	/	{"source": "hero"}	mobile	Gurugram	India	2026-08-11 09:34:38.896
1976baf4-58a6-4320-a21f-68d68d668d9d	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-11 09:51:15.204
d7a19ed7-f27e-4cf5-86be-65404b9561ce	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-11 09:51:16.507
9c46982c-316a-4c3f-9063-86ce710f21e1	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	Jaipur	India	2026-08-11 11:21:02.732
8b9fa9ab-b387-45c0-a346-6a2a87fa5f31	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-11 09:51:20.326
1b987ef4-8fc5-4614-89de-1b02254803d4	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	mobile	Gurugram	India	2026-08-11 09:51:20.393
77049309-67b5-4b60-bffe-f3dddba6200b	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-11 09:51:20.399
c22b0bd5-eae1-4e70-8542-e3ce4a2fe2bf	whatsapp_click	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"total": 14250, "source": "product_page", "quantity": 50, "productName": "Eco Polo Tipping", "pricePerUnit": 285}	mobile	Gurugram	India	2026-08-11 09:51:30.158
5c333b81-f316-4360-a25f-9f26f51e5d29	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-11 09:51:41.286
a4977a8a-6fb9-41c2-b9c7-12752cf4b5a6	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-08-11 11:17:48.187
52636fca-2095-4507-9f22-3b998f9bd598	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:17:59.63
ec1e29fb-ef87-48f6-862e-f3334100bf34	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:17:59.652
9d2aa22d-4eb5-4537-af09-3f5ed924e906	product_card_click	/products	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:18:15.013
268102e5-87e0-4fac-8f53-84f44baa7924	product_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"productId": "bdb776f3-6cb6-4da5-b60d-47339af1ceb6", "productName": "Premium Polo 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:18:15.031
48100df1-03df-4339-81e3-de8a7f0da2ce	page_view	/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6	{"path": "/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6"}	mobile	Jaipur	India	2026-08-11 11:18:15.013
4de08ced-bd01-4fa0-a037-188636575bc6	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:19:20.968
89f49de2-d0bf-4274-a5ae-40062ad967c6	product_card_click	/products	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:19:25.761
343d87e6-8194-4ac6-bdb3-4377ea11bd90	page_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"path": "/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03"}	mobile	Jaipur	India	2026-08-11 11:19:25.782
b932d9c6-4fa3-4c79-bff9-f828e762bd06	product_view	/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03	{"productId": "a6fa9e13-d502-42a4-b37d-0a0b713b5c03", "productName": "Polo Spun Matty 200 GSM", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:19:25.862
7ecdbd49-7392-436f-a7e7-2652a6e4febf	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:19:34.893
f98ba470-563f-464e-bd3a-e6e33ccb5e37	product_card_click	/products	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:19:58.207
53d095bd-3fd9-4154-b2bd-4d110bb8b80c	page_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"path": "/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a"}	mobile	Jaipur	India	2026-08-11 11:19:58.221
a23de934-b577-4b45-bd49-a427c3b11004	product_view	/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a	{"productId": "8ba2803a-79bc-44d8-a196-3b9c908ee53a", "productName": "Round Neck 112", "categoryName": "Custom T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:19:58.236
509aabcd-7ed6-496b-accd-6f89e57e8e12	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:20:04.193
7f4c392d-f15f-4e7b-859c-0d7baa6e1afc	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-08-11 11:20:06.132
6393bf60-7497-442c-b041-dc00b84bfd60	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:07.672
074c310a-2221-4ef8-b8da-8de34753782b	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:20:07.741
d591aaf7-f715-493d-9547-8b2e615ccaa8	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:11.353
405a4339-25d0-40b1-a57a-4b8d483ad703	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Jaipur	India	2026-08-11 11:20:11.374
57315b06-c2a2-467f-aff5-832c87ecf608	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:11.435
289d9a8d-c61e-4d7b-9345-3ebf437bb283	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:20:16.344
a03e123a-44e2-4801-ac86-5512db5cf6b5	product_card_click	/products	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:18.133
032e3b14-3348-456c-aec9-9a3f58d8fe46	product_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"productId": "d7ee7563-6263-433f-bced-e37fdf1797b8", "productName": "Cotton Terry 210 GSM", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:18.192
1020ee96-2c63-4d7c-8096-51b8e2908ba9	page_view	/products/d7ee7563-6263-433f-bced-e37fdf1797b8	{"path": "/products/d7ee7563-6263-433f-bced-e37fdf1797b8"}	mobile	Jaipur	India	2026-08-11 11:20:18.193
34b52072-3e7f-43fb-8de1-07890118a7d6	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:20:22.361
dd568dac-70e0-42ee-8744-285956ced9dc	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:28.977
d73aa1b0-5694-4f63-8d62-15cdb3775d93	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Jaipur	India	2026-08-11 11:20:28.977
b7076615-52f1-46ae-9a56-b74c81c0292d	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	Jaipur	India	2026-08-11 11:20:28.982
932d998f-fe32-4e24-a81b-69d949da17f5	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:20:44.685
35182633-82be-439d-a79d-ab61086c3965	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Jaipur	India	2026-08-11 11:20:47.516
6cda7b8b-faa9-4b18-a585-4182c6ca8328	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Jaipur	India	2026-08-11 11:20:58.602
ea62193f-4bc6-4b25-8a3f-32597cfdda6e	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-08-11 11:21:05.086
a02e424a-a5a5-4d1b-823d-d4e2fd61f3ca	page_view	/products	{"path": "/products"}	mobile	Jaipur	India	2026-08-11 11:21:15.311
d6b97ff7-1f76-4c6d-a971-1295fc66f59d	page_view	/	{"path": "/"}	mobile	Jaipur	India	2026-08-11 11:21:22.269
bca957c1-7833-4dc7-b55f-308c32734b06	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-11 13:22:41.488
c9eff347-dde4-4ade-9a66-e7d85785cfb7	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-12 02:24:07.402
18c73471-c8d4-4fd5-a921-1054501295ab	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-12 09:04:57.625
a5e6468b-30c6-4888-9962-e87978f9cf09	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-12 09:05:02.588
5690d7d3-80de-41fc-aa3e-705f05b2e80e	filter_applied	/products	{"value": "Cotton (100% Cotton)", "filterType": "fabric"}	desktop	New Delhi	India	2026-08-12 09:06:16.996
d4f4508b-71e6-461d-922b-6e0bd1678ed1	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-12 09:06:26.259
7a431aa4-2f11-433b-a223-fb15eba8d99e	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	New Delhi	India	2026-08-12 09:06:26.279
99556fc0-cb6e-41e1-a0ec-47051abe6145	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	New Delhi	India	2026-08-12 09:06:26.283
b3e6749f-8548-4b18-bd59-b84c03849842	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-12 11:18:18.981
370cd3f6-e311-4c34-bd59-4e12d8d95390	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-12 11:18:19.91
30258d8e-046e-424a-96eb-8679557b125b	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-12 11:18:37.691
751da43f-79fe-46d5-aa25-e07332ee3c49	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	mobile	Mountain View	United States	2026-08-12 11:19:26.501
97e13f44-101c-49a7-9479-36566d9a1566	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	desktop	Mountain View	United States	2026-08-12 11:19:27.185
413160eb-19da-4ace-84fd-cafa457785d8	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	desktop	Mountain View	United States	2026-08-12 11:19:28.422
72ac3e41-203e-4da7-bc44-a8546c007c3a	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	Mountain View	United States	2026-08-12 11:19:28.733
2090fb5c-7230-4519-98ab-c6be13881004	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-12 13:26:46.822
1f1b63ba-ab51-4838-825c-b69db19ca96b	page_view	/	{"path": "/"}	mobile	Siliguri	India	2026-08-12 13:27:31.733
2da3443a-afee-4977-b48e-7582c9664593	page_view	/	{"path": "/"}	mobile	Siliguri	India	2026-08-12 13:29:23.342
910cf311-727d-4f00-9a61-9d255a984324	whatsapp_click	/	{"source": "hero"}	mobile	Siliguri	India	2026-08-12 13:29:45.317
e221ae2e-4b10-4150-8e2b-54f38ccbb689	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 14:11:22.29
0df46630-b4b2-4e08-96dd-ea440c705585	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:11:26.455
ce345923-78b8-475a-bd2c-675050b820ed	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 14:11:26.512
2d4e40c0-6ad4-47ce-94d9-a91bbeb7839b	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:11:56.837
6135ad68-0e75-4e8a-9dcc-a079f97febf3	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-08-12 14:11:56.848
9e7b1ca7-0a41-491a-8e09-0982d84c12ba	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:11:56.856
95911fe3-62b8-49fa-98da-c15064c18dd5	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 14:12:46.203
3e7eb93f-76df-42e4-8ddb-2b5dd9633084	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:12:47.894
a6582fc2-7ebc-4fe0-b9b5-d30488b48aac	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 14:12:47.981
fa4f7b33-98d2-4d25-a3fc-e053eb9d5301	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:12:49.136
1a771d63-d35c-457e-9a6e-34377e9b7c86	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	desktop	Noida	India	2026-08-12 14:12:49.145
eef0d8cd-68e0-4c9b-8328-8e77e4b8cd49	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:12:49.235
c06d4146-3ebb-4883-aa35-0bcee10f07d3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 14:13:04.826
6685787e-20b1-41ae-8231-ceef0c7440f8	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:13:07.417
3a739a17-de98-4392-ae5b-f6a787c38cfa	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	desktop	Noida	India	2026-08-12 14:13:07.49
da4fa743-5b89-40b6-8f5d-e92e883760d0	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 14:13:07.524
aab18d4b-72e0-45a4-a49a-3d1d1a6297e2	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 14:13:17.509
55dafdcf-66b9-40d7-b94b-1796577ad2df	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-08-12 14:13:19.438
a5f1b313-be09-4458-a5a6-343b6ec91311	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 14:13:19.516
b2986d12-738c-444b-9ed7-474ecca7d8c5	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-12 14:13:59.759
92c4c89f-b512-40be-8655-0c17aa6c52ca	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	Noida	India	2026-08-12 14:13:59.783
b239f354-4bec-483b-8de3-ebc501e3ad11	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-12 14:13:59.807
7d35695c-70cb-4c48-a895-445d7c87677c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 14:14:14.862
75166752-909e-4596-adb0-95910ba3826d	whatsapp_click	/	{"source": "hero"}	desktop	Noida	India	2026-08-12 14:14:23.313
82fd46b6-c061-46c7-a15e-8ad157f0d256	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 14:14:30.071
3993a2b1-c6e8-4474-b3f7-8fd3b20a96bf	product_card_click	/products	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-12 14:14:32.944
e52eec97-9bcc-4afd-9d80-e7c19f1bd7e5	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-12 14:14:33.008
764c0dc9-718a-4b72-bcf0-a556dd0e2895	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-08-12 14:14:33.027
d1944c26-2206-4531-8c76-74a6d6933fc4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 14:14:35
f7719d88-e86c-4918-b195-20f5981235fc	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 14:19:51.177
b5b21b96-ed2c-44db-9df7-daa7d9cfe1a8	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-08-12 14:19:51.175
817c25be-405c-40fe-b54e-068041cd6e01	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-12 14:19:52.183
193b8d3c-bea9-4664-9808-5b29626a8351	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	Noida	India	2026-08-12 14:19:52.204
31259f19-3fa3-4b2d-83ea-1f7d8afa7d63	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-12 14:19:52.247
3bea6e44-34fc-41b3-a6e5-c6ceaa7fe78f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 16:11:49.682
7cfe6c00-3dcc-4b52-8569-6428775c5d80	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-12 16:11:57.174
ba036008-5970-475b-93d0-c6a464b5e740	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 16:12:00.574
dce25a21-cc4c-41a7-acaf-588a325005b2	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-12 16:12:00.663
06154034-5367-43ba-9676-affe5fe95c66	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Noida	India	2026-08-12 16:12:00.664
07e58179-1d3c-4c05-8289-681700507037	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-12 16:12:04.225
47aed017-a33a-49e5-9462-40bac685da67	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-13 05:16:12.399
158d08a9-9126-422b-87ba-f502639dbabc	page_view	/	{"path": "/"}	mobile	Agra	India	2026-08-13 07:07:40.395
c4e09b18-1fe4-4cdd-a978-644f21ed23ed	page_view	/	{"path": "/"}	mobile	Noida	India	2026-08-13 10:42:10.15
4603c4e1-1d13-4f6e-9177-9b79824992fe	page_view	/products	{"path": "/products"}	mobile	Noida	India	2026-08-13 10:42:14.842
10f53fd0-6e3e-420e-8cb5-b27a736c76cb	page_view	/	{"path": "/"}	mobile	Noida	India	2026-08-13 10:42:38.165
2ae79220-6655-4a6b-909e-133dff87e32d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 13:15:45.398
5ae93c13-cc69-4f4f-a14f-9ec455aa56aa	product_card_click	/	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 13:15:49.445
16d9a4cf-321d-4bf6-82ad-10acd3a3070d	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 13:15:49.541
33090464-395c-4e43-a0a4-e7093da0c14c	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	desktop	Noida	India	2026-08-14 13:15:49.553
cc883172-ca6d-46a3-abd8-e397d9a11667	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 13:15:52.726
ddfab4f1-253e-4081-9f2f-0721d269963d	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:30:32.58
bdd0d103-4264-440a-bb5a-40e0f0eb0cd5	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 14:30:35.111
261951d0-6dd2-4c80-a50a-2d7c74beec7a	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:35.228
7c37f754-0b0b-4025-ba0d-48fcf21566c3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:37.15
cd96f035-b74e-4b9c-ae0c-61c58db12633	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:37.658
3ad830b4-6098-4c09-8eb0-8c0080a5929b	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:37.797
fcf74b7b-8a81-4b7f-af06-4c5c164bc3d8	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:37.953
90f47de9-c8ec-4a1c-9746-a06463890b51	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:38.283
1ef37163-183e-4ba0-9270-59a769a12b75	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:30:38.591
6e861525-2ab0-4078-b1d4-e969e6defdc9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:30:39.97
8542f36f-3224-4f51-962a-4ec8a542ba6c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:31:16.938
01447a5f-27f8-4e6f-be62-d8bb2c19b0cd	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 14:31:22.861
2c6a0ff8-f549-4944-986c-359bc05bc04c	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:31:22.868
4b942a53-3a8d-4e6f-ac61-46dc9af626f9	product_card_click	/products	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 14:31:25.676
38c86f9d-d1e0-4a59-a6e1-50aeb675e78b	page_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"path": "/products/332a089c-172c-4108-b3f7-46b4d6d463ca"}	desktop	Noida	India	2026-08-14 14:31:25.701
e85de8e7-9147-4804-a8dd-2a3e557478b3	product_view	/products/332a089c-172c-4108-b3f7-46b4d6d463ca	{"productId": "332a089c-172c-4108-b3f7-46b4d6d463ca", "productName": "Round Neck True Biowash", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 14:31:25.836
9bceada0-b8eb-416d-a69c-988b5ab1d96c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:31:28.311
67170bcd-8067-4a05-8d09-e68c01e3a870	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-08-14 14:31:34.436
b76b6bf1-bbd6-452c-919a-672fae9b7f7d	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:31:34.468
e890bbf0-c4a2-46f0-af5c-69ab45c578fa	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:31:37.004
9ec86b91-01a0-4b24-abf6-9c5d9836ae9a	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:31:39.371
0ef07af6-60a1-43db-beb0-931bccff2b88	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:32:43.27
83e5c973-1d17-4907-85dc-c5cc64c812d0	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 14:32:45.457
ea82320b-c419-4941-bac8-e5be371848f3	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:32:45.762
1ada3af2-5ad4-45fc-84c4-237595976cfb	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 14:33:02.812
6500ad7b-f69c-4cb9-b818-68717f65fa42	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:33:02.831
8341a15b-37c6-480d-a330-4eb68899f78b	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:33:05.407
d68f676a-9a77-4d9d-83d6-86e8d392dd59	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:40:10.381
ef2bc6a9-245d-421c-862d-49ccd01216b9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:40:53.345
92e1dad9-fa22-4da6-9e3b-0aff91dabb27	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:40:57.057
3ab1f1b4-6c1b-4a47-a15c-23be178a43a8	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:53:41.984
fc5f696e-0e03-46f0-a0e4-ba951fe3ac2c	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-08-14 14:53:53.821
ab625077-8129-459c-a76a-eef183a2814e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:53:53.857
edc0ac9e-6284-41e2-be29-121606f65a53	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-14 14:54:13.834
ea1b8452-f64b-46a1-b03d-bf8472171917	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-08-14 14:54:13.838
2916a4c0-2371-45bb-a848-030f9089843f	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-14 14:54:13.853
58500e05-5223-4b24-994b-d1376c6068a9	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:54:16.963
1e5f7fb4-445c-4f13-9c97-c22b360c44ae	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-14 14:54:19.217
3c38ce18-bab9-4151-8a7a-035ad4615994	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:54:19.273
162cd14d-d158-46b6-ba4b-f2e3038571c1	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:54:23.457
9fdd007a-f9af-439e-8537-62b294022e60	product_card_click	/	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-14 14:56:21.085
a4e36194-3939-4059-ba11-629f16bde176	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-08-14 14:56:21.09
611b6730-0523-448c-bb37-2473f952efb4	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-14 14:56:21.114
e0fda632-b7f9-4f17-9a1a-051ecb715557	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:56:22.635
965e6420-9087-4b9c-9b6b-fe04335b2f50	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-14 14:56:28.269
80a1a2c0-71a8-4487-8de4-17c11e48a3cd	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 14:56:28.288
49b4afcb-9a16-4eb1-9966-8cc4e5440be5	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 14:56:31.056
820d56eb-2720-41f0-bd5d-ebb168369879	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 15:05:19.291
5132d308-ca5c-483c-9c6f-9634426763c3	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-14 15:45:17.725
0d9b6929-d1a0-458c-a620-08c2e3f95a56	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 15:45:17.724
0176ba39-2504-42d6-92dc-969b503844ea	product_card_click	/products	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-14 15:45:19.522
a952af99-f264-4779-b617-4f41816450cd	page_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"path": "/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8"}	desktop	Noida	India	2026-08-14 15:45:19.523
e11cb02b-15a2-4bb8-b602-53f8a1f1df41	product_view	/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	{"productId": "f5033457-10b1-4ac9-aca0-a99dcc5e4fb8", "productName": "PC MATTI 220 GSM", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-14 15:45:19.594
d6909f8a-3aca-4698-a64e-8b41d5a39caf	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 15:45:22.815
d5f7b3cd-003f-4a56-a00f-6cfbb01828d0	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 15:51:31.86
5ab72f8d-54cb-44b7-8ede-c27f7372df78	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 15:51:32.221
794b9e93-b6a3-4e0b-a33e-c0157d88a2b9	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-14 15:54:15.453
d0f9c4ef-8051-4588-a635-87b452cc6126	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-14 15:54:15.455
cebcc954-61f1-4f05-a4d0-d11feccc10a4	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 15:54:16.382
980d306b-3828-4c70-aa85-a81f85a196ec	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-14 16:08:08.944
4b0e3ab2-310a-4081-adad-8a02504cb648	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-15 05:21:55.51
7ce457d5-6542-478d-b26b-93b01faec92d	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	New Delhi	India	2026-08-15 06:46:35.246
c4064cfb-20dc-445f-9504-74d460965ed0	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-15 11:40:33.924
f7a2685f-0af0-410f-b9f0-3480fdde55e7	phone_click	/	{"source": "navbar_phone_desktop"}	desktop	Noida	India	2026-08-15 11:40:41.294
8da1c834-069a-44eb-aa29-14970b066256	page_view	/	{"path": "/"}	mobile	Noida	India	2026-08-15 11:41:14.127
a8a277ad-d7ca-4efd-a1fa-d778365bb017	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-15 11:41:19.122
04de12a8-9c19-4978-a916-bddaffb153e9	whatsapp_click	/	{"source": "hero"}	mobile	Noida	India	2026-08-15 11:41:26.359
aba74d59-093d-40ed-bf29-91c74c4c7870	whatsapp_click	/	{"source": "navbar_whatsapp_drawer"}	mobile	Gurugram	India	2026-08-15 11:41:29.006
fb51e1c3-505c-483d-a2c6-54e2c69cd52a	whatsapp_click	/	{"source": "hero"}	mobile	Gurugram	India	2026-08-15 11:41:34.008
0dfc1e42-5636-4e7c-9745-c36d672ebb85	whatsapp_click	/	{"source": "hero"}	mobile	Noida	India	2026-08-15 11:41:35.692
e9cb56ff-fa27-4018-a81f-27f2e1c01d19	phone_click	/	{"source": "navbar_phone_drawer"}	mobile	Gurugram	India	2026-08-15 11:41:47.412
e4decba3-eed9-4e26-b60a-931beec4329e	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-15 11:42:05.829
d29dcb83-d67d-45da-92fd-3eceb5c6e375	page_view	/	{"path": "/"}	mobile	Gurugram	India	2026-08-15 11:42:07.453
3131b6a9-de35-4df3-ac8b-b974aed102c0	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-15 11:42:09.951
81276be5-eca1-4dda-bd8a-245afa7fde40	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-15 11:42:10.073
a235033b-d48e-4f47-8760-3eb0a00d71ba	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	mobile	Gurugram	India	2026-08-15 11:42:12.328
01719968-3ab4-4db5-a65f-7093eb724707	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-15 11:42:12.33
c229a285-cc30-437c-b8cd-41a43651feb6	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	Gurugram	India	2026-08-15 11:42:12.407
f20f4fa1-ed95-43fb-9e42-8f9512d4c36c	page_view	/products	{"path": "/products"}	mobile	Gurugram	India	2026-08-15 11:42:23.769
726b26cc-6008-40dd-aeb0-3b61011f154d	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Gurugram	India	2026-08-15 11:42:40.184
6c85ef7b-c0b6-4331-9cc1-820858608886	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	mobile	Gurugram	India	2026-08-15 11:42:40.186
40b2c14f-e43b-413f-9b7b-4db9ce747ba5	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	mobile	Gurugram	India	2026-08-15 11:42:40.186
1a75a642-597b-4538-8230-f904ffb257f3	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-15 11:47:13.05
56d6c0f1-65c6-4a6a-b008-47a1b68a19a1	page_view	/	{"path": "/"}	mobile	Meerut	India	2026-08-15 12:17:29.646
c87dfd26-7338-407b-a127-26e9389b1504	page_view	/products	{"path": "/products"}	mobile	Meerut	India	2026-08-15 12:18:11.772
bdb670b9-0291-4092-9cd6-acd151599b82	page_view	/	{"path": "/"}	mobile	Meerut	India	2026-08-15 12:18:25.615
466a1c70-7c41-47c1-bfd8-6d9228b3da2a	page_view	/products	{"path": "/products"}	mobile	Meerut	India	2026-08-15 12:18:27.945
b8456c07-ae6e-4f6c-beb4-7760df507785	page_view	/	{"path": "/"}	mobile	Meerut	India	2026-08-15 12:18:28.763
f3c57d1c-ee17-4451-8a17-5370f7c1836d	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-15 13:01:16.468
1628c45f-736b-430b-b6d2-895ba3f1c7f9	page_view	/	{"path": "/"}	desktop	Roubaix	France	2026-08-15 20:14:52.626
d0fb6657-8d4d-4fe7-ae22-1deaa4bd0db3	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-16 06:18:37.329
5ec6e28f-89b6-4679-b55b-8d0d4b7a072f	page_view	/	{"path": "/"}	desktop	Ahmedabad	India	2026-08-16 07:56:36.184
8a5350d5-cb4d-4507-9687-8698a88e0e32	page_view	/	{"path": "/"}	desktop	Ahmedabad	India	2026-08-16 07:56:42.056
02a15555-aa54-4c97-b203-77607fe365b6	page_view	/products	{"path": "/products"}	desktop	Ahmedabad	India	2026-08-16 07:56:58.559
8c15ed49-7483-4e32-a897-990574b12bb5	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Ahmedabad	India	2026-08-16 07:57:15.118
443fcf40-3aed-443d-8769-7d77b7c6da3a	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Ahmedabad	India	2026-08-16 07:57:15.119
f9cd7a0e-5260-4c99-bb39-479cbef5bef9	product_card_click	/products	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Ahmedabad	India	2026-08-16 07:57:15.119
3a39956b-5203-4c3e-8bdc-61af4c1f79d7	page_view	/products	{"path": "/products"}	desktop	Ahmedabad	India	2026-08-16 07:57:39.113
5aa89c5b-a2f3-4fd9-b9fd-fcb381ba2efe	page_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"path": "/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd"}	desktop	Ahmedabad	India	2026-08-16 07:57:45.451
2c94d3c9-d0b4-4f0e-80ee-f44a8867c3d4	product_card_click	/products	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Ahmedabad	India	2026-08-16 07:57:45.451
287af382-d5bd-4e28-8acc-1a60b493ba1a	product_view	/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd	{"productId": "ff911850-c0bb-46ab-96e1-0d40fc368bbd", "productName": "Premium Tipping Polo", "categoryName": "Corporate"}	desktop	Ahmedabad	India	2026-08-16 07:57:45.452
efbca033-425b-4d44-92d1-86ae2189e01c	page_view	/	{"path": "/"}	desktop	Ahmedabad	India	2026-08-16 07:57:59.779
f24e821e-531f-4828-a65e-282ab8b21354	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	desktop	Ahmedabad	India	2026-08-16 07:58:09.367
f457b6c6-5c57-4d57-8886-aae93e352b2d	page_view	/products	{"path": "/products"}	desktop	Ahmedabad	India	2026-08-16 07:58:09.383
56306a90-8926-469b-83c4-e0f27e911346	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-08-16 14:17:34.008
b30592fa-5351-4c94-960c-44487bafa677	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-16 14:24:58.495
c9ea29ee-71be-48fd-a72a-039123e7ae27	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-16 21:27:24.096
0ef8ff0e-65af-4ab1-8856-3f29f30ad755	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-16 22:42:28.059
a6b3072e-08f6-431a-b5b1-50a513caa8f1	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-17 07:41:52.725
1d3675dd-7676-4f1a-a0ff-eadc73cdb3a1	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-08-17 08:33:33.059
8f7d5541-84ae-4690-a450-aee45348b923	page_view	/	{"path": "/"}	mobile	Noida	India	2026-08-17 08:34:09.57
cfc29ffd-0d35-4ce9-a103-809fc930da16	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-17 08:34:33.748
5a6e0eaa-4c87-47e1-a295-d067ad8c8d2e	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-17 08:42:26.54
3068b44f-c64b-4265-881e-b3f946f23574	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-17 08:42:54.191
f4f74d0a-e18e-4b69-adab-72d99bacc15f	page_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"path": "/products/737156d2-71fc-409e-ac15-8467beeafb7d"}	desktop	Noida	India	2026-08-17 08:43:01.057
7fadaadc-2a16-4fdd-ba31-0c5e40caeb99	product_card_click	/products	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-17 08:43:01.058
16acb3c9-536d-48c6-8551-1971a6b160ea	product_view	/products/737156d2-71fc-409e-ac15-8467beeafb7d	{"productId": "737156d2-71fc-409e-ac15-8467beeafb7d", "productName": "Round Neck 113", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-17 08:43:01.096
813cb270-ac59-4be1-9ff7-01224a890b29	page_view	/	{"path": "/"}	mobile	Dehradun	India	2026-08-17 09:10:28.89
9f37c8d6-a7f1-47ba-b871-b084968fa2cd	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-17 10:36:36.696
cf452710-adf6-41d8-af73-fafab92c4e47	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-17 10:40:45.382
3142c3a0-040d-430d-95f2-a37626f51f23	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-17 10:41:06.951
28e9549e-361e-4f2a-bb53-0a36262cd3ef	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-17 10:41:06.952
cfe44517-3282-40b9-a5d5-c825b90d1d01	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-17 10:41:34.833
1b12864f-61ab-44c9-824b-ccdeffa4a442	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-17 10:41:37.731
3843057f-cbdf-4553-86a5-9596c9bb1487	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-17 10:41:37.792
41fbaac9-3fa5-468b-91b5-652e29583010	product_card_click	/products	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-17 10:41:47.807
cf7eff26-52e1-4bb6-9a78-d23c2ab11039	product_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"productId": "5bc3c681-3786-441f-9b28-f60429b93ca1", "productName": "Eco Polo Tipping", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-17 10:41:47.817
e219540f-78da-4067-92d4-019b99acc14b	page_view	/products/5bc3c681-3786-441f-9b28-f60429b93ca1	{"path": "/products/5bc3c681-3786-441f-9b28-f60429b93ca1"}	mobile	New Delhi	India	2026-08-17 10:41:47.818
5584f0dc-024a-4c4d-ab5d-6a3ed1cff847	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-17 10:44:02.694
a8881131-7a5d-4673-a68e-9d63aa94e1fd	product_card_click	/products	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-17 10:44:15.819
64e5fb65-43ab-4a39-8479-caf0c6e0e4fd	page_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"path": "/products/d18abd68-8383-44c8-93eb-a15fbe77ab15"}	mobile	New Delhi	India	2026-08-17 10:44:15.82
508a2556-e094-4573-a49e-3e1c63037ec5	product_view	/products/d18abd68-8383-44c8-93eb-a15fbe77ab15	{"productId": "d18abd68-8383-44c8-93eb-a15fbe77ab15", "productName": "Biowash Round Neck", "categoryName": "Corporate"}	mobile	New Delhi	India	2026-08-17 10:44:15.824
82f56a90-0f7f-4b36-a64a-a26c3d23fe8d	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-17 10:44:43.803
b529a688-f9de-4241-85f8-4be13895f05b	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-17 13:40:35.98
a65908ef-22c8-47b0-b8f1-7a81c63f7f23	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-17 13:44:41.347
db9a67dc-2be1-48fd-9ef4-67600e1ce081	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-17 13:44:42.204
927597ac-88d6-421f-81ed-b61e41aa1705	page_view	/products	{"path": "/products"}	mobile	Morādābād	India	2026-08-17 17:09:47.079
114ae843-3f34-47b2-b789-89d8c9abe2f0	page_view	/	{"path": "/"}	mobile	Dimāpur	India	2026-08-17 20:10:28.107
9a7162ad-8cc0-4718-b21c-2c63ea416c6c	page_view	/products	{"path": "/products"}	mobile	Dimāpur	India	2026-08-17 20:10:31.07
cd69d5e8-88e3-451e-9345-a638e430cd58	product_card_click	/products	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	Dimāpur	India	2026-08-17 20:10:55.179
6d6af52e-fa61-4611-8606-63c57e5e9b59	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	mobile	Dimāpur	India	2026-08-17 20:10:55.196
07557fca-887f-47dd-8e84-d9e87850f538	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	Dimāpur	India	2026-08-17 20:10:55.21
9d643edd-abfe-46a2-bd73-f513effcb8d4	page_view	/products	{"path": "/products"}	mobile	Prayagraj	India	2026-08-17 23:15:23.169
6a52b536-4d03-4550-99b3-e0a45c8575fd	page_view	/	{"path": "/"}	mobile	Prayagraj	India	2026-08-17 23:31:27.361
64814cda-26c7-4ba2-9b26-c498f33afbcf	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-18 05:33:46.724
e585be8e-819d-4bab-9a2a-29fc66402d9a	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-18 07:33:39.269
934a58ff-f3d3-4270-bafa-c486fb1f9229	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-08-18 08:36:14.374
cde59cbe-a6e0-4516-bd0d-f1567935855a	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Kanpur	India	2026-08-18 08:36:23.063
b88a1ca9-ac10-41f6-8630-7a6dfbb929d2	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-08-18 08:36:23.128
1cbbdc14-4118-46ba-84a6-c57667bc9cb4	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-08-18 08:36:29.362
0e6a38aa-5401-4154-9d52-d427b1694bbe	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-08-18 08:36:30.209
2aeb3062-df19-4f3f-9faf-30a3098983b1	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-08-18 08:36:31.819
c92458a8-4b57-45a8-a2bf-dda6570914ef	phone_click	/	{"source": "navbar_phone_drawer"}	mobile	Kanpur	India	2026-08-18 08:36:32.559
813db629-7132-47ba-85ab-3c4d386ddde9	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Kanpur	India	2026-08-18 08:36:44.127
2dfff765-9175-4938-a00d-44892f71d9af	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-08-18 08:36:44.19
26b7b0bf-ba4e-438c-8987-ec156849f9ec	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Kanpur	India	2026-08-18 08:36:48.422
69e69bd2-53cb-4c3b-bb4b-ee5f732383a4	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Kanpur	India	2026-08-18 08:36:48.477
6ae9dec6-81ee-4b87-811c-1c636a43ba82	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-22 05:16:51.618
0d69982d-f387-4cb4-8719-9dd203daf73f	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Kanpur	India	2026-08-18 08:36:48.524
c6625df4-8dba-4047-940f-59b4f26f9919	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-08-18 08:36:56.113
e7012c95-71f8-4dc9-bef9-1d1930e0b708	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Kanpur	India	2026-08-18 08:37:00.863
1c7dfe5d-12ee-4e2e-b4d1-a9695eb13936	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Kanpur	India	2026-08-18 08:37:00.866
5c30b7ae-c93f-4161-8c3f-0e12133551e8	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-08-18 08:37:03.959
20ed6ab0-6a03-48a5-83bc-c13f83221cfe	page_view	/	{"path": "/"}	mobile	Kanpur	India	2026-08-18 08:37:07.644
118191c8-d9f5-4310-8a88-de29dc11fe72	page_view	/products	{"path": "/products"}	mobile	Kanpur	India	2026-08-18 08:37:07.779
b57b4178-9b32-4c1e-a6ad-ad7850b1c4b4	page_view	/	{"path": "/"}	mobile	Prayagraj	India	2026-08-18 12:19:41.977
6e0bdb26-be07-452d-87e8-8222e4e17f41	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-18 13:17:10.379
ce70d2c2-2ad9-479a-9acc-68625c44e62d	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-20 06:04:37.099
efc3164a-7130-4a0d-bc38-5b53055c99c5	page_view	/	{"path": "/"}	mobile	Delhi	India	2026-08-20 08:07:47.252
81a64f1a-d27a-4463-b625-28bb5c03fa1f	page_view	/	{"path": "/"}	mobile	Prayagraj	India	2026-08-20 10:27:33.819
b4e6e407-325a-4150-aef4-4de0bb21eae7	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-08-20 13:24:10.244
18df9be6-72f3-4505-8b1e-b46b136d597e	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-20 13:24:17.974
076bb6c2-4735-4c40-b5db-cb7956ea46b7	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-20 13:55:19.969
ddac5195-5719-41af-81f1-5f6a5ff1e816	page_view	/	{"path": "/"}	mobile	Itaunja	India	2026-08-20 16:25:42.53
cb88711b-7dba-426b-a063-2808785dea14	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-20 22:13:59.422
7c000335-ef3e-43ee-b9fe-66ef70fb1cf9	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-08-21 03:08:21.184
6e0f8d31-6c92-4848-9af2-d49743c24aa9	page_view	/	{"path": "/"}	desktop	Newark	United States	2026-08-21 23:21:16.046
d4ed716b-82a7-4bd4-ad17-d5712b02217d	page_view	/	{"path": "/"}	desktop	Council Bluffs	United States	2026-08-21 23:34:54.745
60af5245-ab19-43d3-88f9-04edc3d2826d	page_view	/products	{"path": "/products"}	desktop	Los Angeles	United States	2026-08-22 01:36:22.859
01cee011-8843-458c-94c3-f36df5b45d83	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Ashburn	United States	2026-08-22 01:36:50.202
76ddd9f4-6db7-4f72-95d4-82072046daab	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Ashburn	United States	2026-08-22 01:36:50.223
f6200032-16a8-4bdd-adce-72c7ac48274e	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Secaucus	United States	2026-08-22 01:37:15.75
e2a88020-6ea5-49dc-8212-e0cd15a0acb0	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Secaucus	United States	2026-08-22 01:37:15.792
e3732618-dac7-4308-80a1-e7ff87bd59d0	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	desktop	Secaucus	United States	2026-08-22 01:37:24.397
ebf3c2c2-c4e1-41d9-b395-e5c9b393d166	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	desktop	Secaucus	United States	2026-08-22 01:37:24.398
b23893a3-4828-4ae5-bfa8-516095bb9c80	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Sterling	United States	2026-08-22 01:37:35.29
36e9a7a2-e70a-4437-b341-b5e074859592	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Sterling	United States	2026-08-22 01:37:35.375
7b91ba5b-7b0f-4d09-ae8f-35db5ca51d3e	page_view	/products.json	{"path": "/products.json"}	desktop	Miami	United States	2026-08-22 01:38:08.159
8733f111-02a3-4ae9-b46b-707dd69ccc18	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Chicago	United States	2026-08-22 01:38:19.605
be3197de-07ec-489f-872a-9d6f0b177404	page_view	/	{"path": "/"}	desktop	Chicago	United States	2026-08-22 02:12:58.058
87130deb-21f0-4e88-b3ba-ca8d1f10772d	page_view	/	{"path": "/"}	desktop	Chicago	United States	2026-08-22 02:14:03.69
8fa8739b-de27-4f9b-aeb6-546e17058e5e	page_view	/	{"path": "/"}	desktop	Ashburn	United States	2026-08-22 02:14:34.118
55a42474-824d-4d7f-8373-27d7df5dd4fc	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-08-22 03:27:45.42
f081d1a9-0d15-4b3d-aded-5b6d2c7fc630	page_view	/	{"path": "/"}	mobile	Jalandhar	India	2026-08-22 05:10:37.92
53c43df1-b4b4-4162-b444-eedb58510eb0	page_view	/products	{"path": "/products"}	mobile	Jalandhar	India	2026-08-22 05:10:43.746
8e42c7b9-774d-4740-ac42-bde82edfe2f5	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	Jalandhar	India	2026-08-22 05:11:07.371
167124be-2518-4e81-9504-9483fed2eaab	category_click	/products	{"source": "catalog_filter", "categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93"}	mobile	Jalandhar	India	2026-08-22 05:11:09.093
fbf9dcd4-75ab-41ba-b03b-813b04eb57c2	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	Jalandhar	India	2026-08-22 05:11:14.98
f329af7b-c2b3-497b-a908-15b6ba6d5543	category_click	/products	{"source": "catalog_filter", "categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157"}	mobile	Jalandhar	India	2026-08-22 05:11:17.227
2ae7ce5f-5d39-4201-a8b2-41eb86f0842d	category_click	/products	{"source": "catalog_filter", "categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828"}	mobile	Jalandhar	India	2026-08-22 05:11:26.466
63b186c0-7a1d-4b61-a9b4-608e9c9399c1	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	Jalandhar	India	2026-08-22 05:11:27.123
760b6ed8-f6de-4c77-a8c2-95f2586cfcb4	page_view	/	{"path": "/"}	mobile	Jalandhar	India	2026-08-22 05:11:32.311
86283789-effd-41f8-a102-42f666ac7cd2	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-22 05:16:49.881
a60fe1ea-0ea0-4cbe-8027-5b000ff1c2c9	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-22 06:20:25.012
2825f9c6-ba35-4290-a20f-0f8fa6b94ba4	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-22 06:20:32.658
1a43a0f5-aa14-4c9e-9e8d-613b72cb926a	page_view	/products	{"path": "/products"}	desktop	Mountain View	United States	2026-08-22 06:21:07.351
5903a9dd-23ab-4366-a5a6-0ff518320931	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:21:49.558
279938db-8f12-4650-a36a-5fb2c5c67f3f	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-22 06:21:49.58
21666233-714b-4fd0-9eef-923f448d5d40	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:21:49.585
a8f03861-5e6d-42a4-9afb-8cab43bac4e5	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	Mountain View	United States	2026-08-22 06:22:05.272
1ad74cb4-2d60-4e9a-9c05-ee02228f7f4a	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	Mountain View	United States	2026-08-22 06:22:05.931
32953506-3978-4b7d-bbc8-769d2136a0ca	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	Mountain View	United States	2026-08-22 06:22:06.647
79077025-3c6e-41c4-abf9-6049452795b0	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	Mountain View	United States	2026-08-22 06:22:07.357
a7602915-b2fb-4393-a6d1-d8fa9afe3f13	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-22 06:22:07.616
572b9559-2172-4cab-921d-b8194df4b654	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-22 06:22:12.645
c159c57d-5719-4df9-b6e9-d6229b7bbc32	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:12.65
f7bfe9f7-b4a8-4e61-9cd6-715df42d1b08	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:12.666
f76e797c-0e7d-4d56-9e31-74afae8bc695	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-22 06:22:14.285
4fd4f7a0-1188-4f0d-a889-e845f090685e	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:16.862
ba0deb38-7256-4e7e-8075-5df8c3e7f868	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-22 06:22:17.734
5ed08140-b04c-438d-97ba-8268d8714bcd	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:17.803
f145e580-f948-4377-881d-76ddbcfa0fc1	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:19.904
40dd9f8b-938a-4774-a65d-0bae02b3d0cb	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-22 06:22:20.308
bee35621-5f6c-4aa1-a237-7571e98e441b	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:20.319
66a29829-3e5c-47c7-88a0-3cf5f0b87e98	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:31.168
01e5487c-5c71-4614-bf41-9c37e1b454d0	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-22 06:22:31.179
4b82aa38-7b0c-4b0f-a42a-db5d24e44014	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:22:31.204
4e6e1d64-fa41-4d22-bc44-c601f727c085	whatsapp_click	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"source": "navbar_whatsapp_desktop"}	desktop	New Delhi	India	2026-08-22 06:22:35.529
a18aca49-9c3f-4471-bec1-2ce36e60b441	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-08-22 06:22:35.782
8a49a1ec-ac80-4a52-b66c-a815616f8f61	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Lucknow	India	2026-08-22 06:23:14.826
ee62506e-4bc4-40af-bb55-1576b53d80d5	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-08-22 06:23:15.723
daaa04f0-bc8e-47fb-8f80-6c3d7ddaeba2	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-08-22 06:23:37.743
591abce2-3485-452d-9187-bb16ac8ffa0a	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-08-22 06:23:44.886
2044bb2d-a39a-4676-b1f7-3bd2b8140c97	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-08-22 06:24:03.642
1c55c02e-cbb1-4add-aa9e-4fb32e396cb5	category_click	/	{"categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-08-22 06:24:08.482
b0f17a2d-57a8-4d61-b93a-532dd5d68bf7	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-08-22 06:24:08.502
6d2efa54-374a-4472-8c3c-903415f14a52	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-08-22 06:24:21.378
6c89ac30-c7a7-4867-a5fe-162a5e0a9a3f	product_card_click	/	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-08-22 06:24:35.045
f88f5fb6-d392-4b89-aa48-4a56fb31dbd9	page_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"path": "/products/f05883de-2d1f-41b5-b06f-f4154461aede"}	mobile	Lucknow	India	2026-08-22 06:24:35.05
bad18c17-950a-4e41-a07d-522b1c12352e	product_view	/products/f05883de-2d1f-41b5-b06f-f4154461aede	{"productId": "f05883de-2d1f-41b5-b06f-f4154461aede", "productName": "GIFT SET", "categoryName": "Corporate"}	mobile	Lucknow	India	2026-08-22 06:24:35.062
8b038676-c741-4c7f-bf1b-c04b2e81b681	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-22 06:24:53.118
3b2fb94f-fc7a-4aa7-aa94-2a0a45ab53ef	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-08-22 06:24:56.082
1c8306b5-e8a0-4d7f-8337-18896b03fa3d	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-22 06:24:57.233
582c242b-ede1-4d50-b07d-c1da30c9171a	page_view	/products	{"path": "/products"}	mobile	Lucknow	India	2026-08-22 06:25:07.314
359e0d3f-4d89-4105-954f-368c35cde426	page_view	/	{"path": "/"}	mobile	Lucknow	India	2026-08-22 06:25:08.275
87081f9d-5478-4caa-be32-0338f53022e7	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:25:13.601
25ec06b2-712b-4874-8945-c1f9e8b11705	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	desktop	New Delhi	India	2026-08-22 06:25:13.611
c32111ba-09f8-46ab-a6b8-2e7e626e916e	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	desktop	New Delhi	India	2026-08-22 06:25:13.615
c33425fb-1e6d-4d27-ab12-7ab1a68926fd	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-22 08:02:22.634
a88b2f88-a97a-4fe1-bbb7-0aa6d7d1c932	page_view	/	{"path": "/"}	tablet	Ashburn	United States	2026-08-22 08:04:09.044
8889acf7-5c0f-46d1-871a-1d0500b9ea8a	page_view	/	{"path": "/"}	mobile	Morādābād	India	2026-08-22 09:00:36.103
b9fd4c2c-75cb-49be-b794-b51440cf0504	category_click	/	{"categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86", "categoryName": "Custom T-Shirts"}	mobile	Morādābād	India	2026-08-22 09:02:52.055
634e1e2c-dbf1-4d2f-bcc7-e0a407af9b32	page_view	/products	{"path": "/products"}	mobile	Morādābād	India	2026-08-22 09:02:52.061
36a3b330-0998-4ea8-92d7-7348968e6f89	page_view	/	{"path": "/"}	mobile	Morādābād	India	2026-08-22 09:03:01.415
40005c02-8735-462c-9ccb-3e69732c21c3	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-22 09:46:44.046
1dd36b16-082f-41a8-93d1-6fc888085ab0	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:46:59.109
edbc4e57-017c-4590-9ae3-13bb032fb68c	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-22 09:47:18.982
40dfeb4e-1e6c-4c73-9134-5e5702e22f2d	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:47:42.827
63ed53a7-fed1-4dd6-b0fe-57cbe94763f2	product_card_click	/products	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-22 09:48:33.299
ff64b047-49ec-4e2b-88e9-70f0038551f9	product_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"productId": "d0163b49-520e-46c2-bdf2-a845eb71ec17", "productName": "Premium Cotton Terry 220 GSM", "categoryName": "College T-Shirts"}	mobile	New Delhi	India	2026-08-22 09:48:33.384
73d4498b-d674-4e76-9428-fc5d34021e2d	page_view	/products/d0163b49-520e-46c2-bdf2-a845eb71ec17	{"path": "/products/d0163b49-520e-46c2-bdf2-a845eb71ec17"}	mobile	New Delhi	India	2026-08-22 09:48:33.385
946d0377-64dc-4653-8389-61dc827a0e14	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:48:35.361
7fa660f9-b132-43a2-8a2c-285f1bc2f98f	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:48:54.974
9df9bdc4-7481-4cbf-aaa8-6bc220fae8b6	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-22 09:51:32.775
df8a5527-7c63-4f69-bee5-cac92be2cb29	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:51:32.794
facb45f4-f011-4844-9f20-a63ee6a53425	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:51:33.651
1e5c6994-dbbe-4d75-b9fe-08a1c238c7b0	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 09:51:53.459
0eef7ec2-19ac-4ad3-bef5-27c3a3cceabf	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	mobile	New Delhi	India	2026-08-22 09:51:53.532
a373edb4-2e72-4536-8acb-780004deb59a	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 09:51:53.808
e4a234cb-bb88-4b63-a04e-53bb84613f0c	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-22 09:53:59.503
ae21569d-0009-4990-aded-90716024f594	page_view	/products	{"path": "/products"}	mobile	New Delhi	India	2026-08-22 09:54:13.069
6df41492-0960-4b42-838c-775e5b80f6bc	product_card_click	/products	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 09:54:20.934
c7d6c77f-18a8-4991-bacf-971c969b1a72	page_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"path": "/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f"}	mobile	New Delhi	India	2026-08-22 09:54:20.987
1e102b4d-33e0-4755-8922-401835477098	product_view	/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f	{"productId": "3a088ad2-1312-45b0-8a3d-bbb252599f9f", "productName": "Kids polyester t shirts", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 09:54:21.012
75ed9be9-ec68-45f6-9246-0e6c0553c17b	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-22 09:59:13.944
10625712-e322-4833-a65f-89d5790ce5b9	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-22 09:59:15.843
d9960dfe-26bd-4dfb-b426-4f64814d4f0e	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-22 09:59:24.11
93187a2b-982b-4853-b5f6-3197a0092df5	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-08-22 09:59:24.124
461158f1-ad61-46d8-b0fd-ad000038b925	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-22 09:59:24.131
f7c9274c-d208-463c-bed0-a1643565f80b	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	Mountain View	United States	2026-08-22 09:59:38.212
4f6171b2-9766-4924-bfcb-4716cc6eab8b	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Mountain View	United States	2026-08-22 09:59:40.038
618cb96c-a5b9-43f4-a843-4713eb0d844d	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	Mountain View	United States	2026-08-22 09:59:43.581
4ab3ba53-73c7-4b09-86d2-5e4db19e322b	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-22 09:59:44.246
63996dec-3186-486f-9c76-472ce0d6d97e	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-08-22 10:04:35.671
ad76ef19-2db7-4b7f-8470-2a37e2db2223	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 10:04:35.767
7b874586-93fd-4a86-900a-e25df33b5101	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-08-22 10:07:55.62
9526dfa3-6f79-45ec-a9f7-499f4149f475	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 10:07:55.626
19ec68db-da09-475a-9594-034e17c1605d	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-08-22 10:14:41.208
7702a164-b296-4137-a876-f39b07228064	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 10:14:41.243
b033577a-3e71-4b3b-bfb3-2d26cb27cbf2	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-08-22 10:52:35.944
b4ddf327-75b9-4ab0-bfa9-e156933f69cd	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 10:52:35.973
03f6dcfe-78ca-481c-80ab-485934df10b3	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-08-22 10:52:55.136
200fbece-5624-494d-bdc9-2b8cde27f65a	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 10:52:55.156
009bf9d3-5e4c-4976-b4cc-88ff4abf09c6	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	New Delhi	India	2026-08-22 13:53:28.14
3dade8fa-c8f1-4854-b0fd-dd3adf919d1b	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	New Delhi	India	2026-08-22 13:53:28.167
541853f9-b51b-417d-85e3-81ec68a49cf2	page_view	/	{"path": "/"}	mobile	Prayagraj	India	2026-08-22 14:27:09.435
2bf4a40f-a366-4482-ab2c-f347958c0f88	page_view	/	{"path": "/"}	mobile	Basti	India	2026-08-22 15:59:46.926
c0c1fa52-4e18-419d-a288-c5ad2524d714	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Mountain View	United States	2026-08-22 16:45:37.556
626b0bea-115b-44b8-8b37-d8aeb047b58b	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-22 16:45:37.88
cc0d01cc-13bb-4d47-806d-646ee0406f1c	page_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"path": "/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c"}	mobile	Mountain View	United States	2026-08-22 16:47:04.151
430da5c1-f7c6-41fd-8570-d48fd2e0e173	product_view	/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c	{"productId": "89c9d036-8a2d-45a4-97d2-05ea9051a67c", "productName": "Round Neck 116", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-22 16:47:04.949
5ba8cd2b-93b2-4e77-8b74-b89ebdf355ed	page_view	/	{"path": "/"}	mobile	New Delhi	India	2026-08-22 17:20:15.307
0617609c-c54b-4c53-b4c7-b4ea1c8aff04	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	mobile	Mountain View	United States	2026-08-22 19:18:19.987
27336a4c-eaa9-48e2-947a-af8ed6044053	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	mobile	Mountain View	United States	2026-08-22 19:18:22.155
62ffd5ee-81e0-43ed-9163-2ba4164e974e	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	mobile	Mountain View	United States	2026-08-22 20:53:16.755
2fb53a33-f0fd-4b7d-b1f5-11bfb6fbb72d	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	mobile	Mountain View	United States	2026-08-22 20:53:18.062
303b9fc4-76cd-41cb-bfb4-7db718aa9ad3	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	mobile	Mountain View	United States	2026-08-22 21:46:59.923
f97b85d8-c8d0-4284-a4fe-144f8c9432ea	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-22 21:47:01.246
8b13ee1d-b28f-4e1f-9794-45764af623a2	page_view	/	{"path": "/"}	mobile	McKinney	United States	2026-08-22 23:31:06.78
fae4d1a8-5f08-463f-903d-7107573865d0	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:31:22.074
c07caf0e-834a-404a-ac8e-d4c82c0f88c7	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	McKinney	United States	2026-08-22 23:31:54.948
cbe8af0b-e3a4-4363-84c6-400b610afe71	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	McKinney	United States	2026-08-22 23:31:54.95
4de586ae-0656-4703-8725-0889fab12e38	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	McKinney	United States	2026-08-22 23:31:54.952
62a75ce8-7f89-433c-b558-a5144f99c569	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:32:05.023
357ae3d4-8dcc-449d-bd6e-52e0aa856850	page_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"path": "/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a"}	mobile	McKinney	United States	2026-08-22 23:32:19.836
b3bf74c6-c63e-4efd-90a7-83d6e21d54d7	product_view	/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	McKinney	United States	2026-08-22 23:32:19.837
9c30db9c-4e9e-4e70-acef-0baecb752da6	product_card_click	/products	{"productId": "b9a62212-8ee0-4fe4-9aa7-a5b38879474a", "productName": "Round Neck 114", "categoryName": "Custom T-Shirts"}	mobile	McKinney	United States	2026-08-22 23:32:19.838
90a4566e-952d-4951-be21-2e11f350aa18	product_card_click	/products	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	McKinney	United States	2026-08-22 23:34:16.169
325fabba-f6fe-4150-800a-086bd4633c19	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	mobile	McKinney	United States	2026-08-22 23:34:16.173
3a22ed42-2448-4369-a7d2-c92f92fd58ea	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:34:16.647
1af9b8e4-6773-4395-b775-9035b0772763	product_card_click	/products	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	McKinney	United States	2026-08-22 23:34:18.216
48ffd3c4-7408-458c-8785-c25ff07bddba	product_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	McKinney	United States	2026-08-22 23:34:46.302
9544eea2-14a8-462e-a0be-540fc2233542	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:35:16.163
7830dd86-fe9b-418e-b22a-f72c11cb39d2	page_view	/	{"path": "/"}	mobile	McKinney	United States	2026-08-22 23:35:22.922
ae258bd0-3dec-4395-be94-2ff03388dc78	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:33:16.635
3ff1caf0-c2ac-4111-bfef-f7915c4adc37	category_click	/products	{"source": "catalog_filter", "categoryId": "7503fab7-02bd-451d-a24d-7fde13ef86b2"}	mobile	McKinney	United States	2026-08-22 23:33:21.482
96a06565-10eb-4a5c-9eb4-d57e79ba6fbb	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	mobile	McKinney	United States	2026-08-22 23:34:16.169
5669fe5c-b014-413a-aa55-b9b60b2daf66	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	McKinney	United States	2026-08-22 23:34:18.217
c22bce6c-81bc-4230-a84f-87cd3e5c0a7c	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	McKinney	United States	2026-08-22 23:34:18.512
9995016c-e1ab-431b-b968-b080ecc9a78b	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:34:22.412
3a38462e-dd30-4191-9aab-3c5ec006fba2	category_click	/products	{"source": "catalog_filter", "categoryId": "6fd9b1f3-fd31-475b-8924-3144cdd34c86"}	mobile	McKinney	United States	2026-08-22 23:34:28.644
3bda89ab-e4ee-48f6-8163-037dfb9f1560	filter_applied	/products	{"value": "2", "filterType": "minGsm"}	mobile	McKinney	United States	2026-08-22 23:34:34.377
00a45401-a57e-4155-bd6d-1bff2ddab934	filter_applied	/products	{"value": "200", "filterType": "minGsm"}	mobile	McKinney	United States	2026-08-22 23:34:34.44
565eba15-64a9-4497-9e4d-a370b2288e69	filter_applied	/products	{"value": "20", "filterType": "minGsm"}	mobile	McKinney	United States	2026-08-22 23:34:34.596
e9b61f4a-b7f1-43ec-86b4-8192100d227c	product_card_click	/products	{"productId": "f7937fc0-24c3-4087-874a-472e78047ecd", "productName": "Premium Matti 240 GSM", "categoryName": "Custom T-Shirts"}	mobile	McKinney	United States	2026-08-22 23:34:46.297
4457a8c6-314d-46bb-9ad9-15da1ca5c560	page_view	/products/f7937fc0-24c3-4087-874a-472e78047ecd	{"path": "/products/f7937fc0-24c3-4087-874a-472e78047ecd"}	mobile	McKinney	United States	2026-08-22 23:34:46.301
ede687d9-e3b7-41f2-818d-fcfb58e361dd	page_view	/products	{"path": "/products"}	mobile	McKinney	United States	2026-08-22 23:36:12.524
e614cd90-94cd-41a4-ad05-9600f5e994ee	page_view	/	{"path": "/"}	mobile	McKinney	United States	2026-08-22 23:36:13.762
9f913ea4-e640-452b-9768-997482f06396	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-23 00:43:03.732
50255c2b-886b-4333-ad4e-9a483f56f1e6	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:14:31.331
f1e7115a-87ea-4b9f-a167-59131e277371	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:15:16.947
fb660ec6-715c-45d1-8721-d97d62852a1b	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:15:21.99
89ed7e0f-1643-4441-8106-a90537241d2f	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:15:32.947
302ab91f-3101-4b57-a748-988b548bd264	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-23 07:15:32.948
08f51b9b-f73e-488a-b3a5-1e9fd1374b60	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:15:34.692
9b1c3626-7853-46da-b325-656aa53b00d2	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-23 07:15:44.012
00310a23-e230-4dab-b197-4109faacd625	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:15:44.052
1edf4521-aa9a-485d-8d0b-cb6f8f4be700	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:15:45.83
d13ce6a0-58e6-4029-bf86-5f4a6d524797	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:15:58.632
679a772f-5b9b-4589-9f6c-d9af9f4dbd31	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:16:00.27
49578700-c798-496a-8318-bcff6214187e	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-08-23 07:17:17.655
107c2a5c-f41a-4a82-ba26-4e7110ad8563	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:17:17.656
13c2adfe-c4f9-4a18-a631-d0020d247b67	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:17:17.656
c5fda152-4e24-4449-a5e6-50f8d396fc52	category_click	/	{"categoryId": "08652fc9-65c6-4743-9ae6-fc9111a5a828", "categoryName": "School Uniforms"}	desktop	Noida	India	2026-08-23 07:17:19.67
438c11f2-7589-4372-ba79-4b39192f8060	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:17:19.731
291d4b28-a286-4ef4-b449-1668d711a568	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:17:22.335
ec45e9b8-0a52-4912-ad5b-25a90a71f2d0	whatsapp_click	/	{"source": "navbar_whatsapp_desktop"}	desktop	Noida	India	2026-08-23 07:17:25.745
2a9e0de7-24c7-48ef-bf9c-bd2e2f07b077	product_card_click	/	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-23 07:17:35.726
cf3f2e6b-5b9f-404a-b8d4-58cbc87a8765	page_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"path": "/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6"}	desktop	Noida	India	2026-08-23 07:17:35.733
69c1aee8-4c14-4760-8f3f-e6088f9f7628	product_view	/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	{"productId": "4a37919d-9ba2-442b-8bd1-5b0b26b7eba6", "productName": "MAHAKAL COTTON KURTA", "categoryName": "Custom T-Shirts"}	desktop	Noida	India	2026-08-23 07:17:35.766
ce3912c5-9b55-4943-8b17-88f45716abc3	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:18:04.347
4ee68d7e-381f-4d1a-a45b-3b4f93801d4e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:18:40.996
9dd9155a-f2a6-423b-8d61-dd89aeb3bcc8	product_card_click	/products	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-23 07:18:46.924
736d7e3a-66eb-441e-b615-1811a14a9eb1	page_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"path": "/products/9ac310be-2d6d-471e-a919-f603da96c569"}	desktop	Noida	India	2026-08-23 07:18:46.987
93ccba8a-e907-4fda-983a-b7c854d7a5ea	product_view	/products/9ac310be-2d6d-471e-a919-f603da96c569	{"productId": "9ac310be-2d6d-471e-a919-f603da96c569", "productName": "Polo Sports", "categoryName": "Sports"}	desktop	Noida	India	2026-08-23 07:18:47.049
3d56ee7a-2e24-4641-b312-cb0a234db18f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:18:49.037
5fa198ed-b9ff-4372-87b7-fa80e8bdd85e	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:18:52.14
673ab915-526e-4a66-94e4-6e2b93123a26	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:19:00.817
79dfe9e6-8668-4b3c-ad88-3e3ead86b5d1	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:19:44.736
2078e694-734d-4e59-8d76-5f3837fce003	category_click	/	{"categoryId": "9fd54e76-cd1d-42a5-8f18-da7436e5f157", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-23 07:19:50.523
ae61bc15-0445-4838-b6f2-cd7b3200201d	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:19:50.557
dbcfe3cb-e75b-41d6-9c5e-bce0ca544d82	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:20:04.096
fa4134b5-a08e-4062-a440-eb5b0b3ceb1f	product_card_click	/	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-23 07:21:58.17
4460e4ae-08f1-4fe7-bb16-d43acbed9b2d	page_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"path": "/products/a44ba47b-5947-4c24-bd37-16a336bd4057"}	desktop	Noida	India	2026-08-23 07:21:58.204
ce4af530-05d2-465a-8243-95f75c0cd353	product_view	/products/a44ba47b-5947-4c24-bd37-16a336bd4057	{"productId": "a44ba47b-5947-4c24-bd37-16a336bd4057", "productName": "Honeycomb Matty", "categoryName": "Corporate"}	desktop	Noida	India	2026-08-23 07:21:58.206
840beb83-2289-42d9-bd24-4bbcd06cd66c	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:22:14.244
bac5dda4-eacf-4192-94ac-75df874d2252	page_view	/products	{"path": "/products"}	desktop	Noida	India	2026-08-23 07:27:11.36
dd5b8b53-c143-4378-b8b0-46afcf0b7b31	category_click	/	{"categoryId": "bb08cb41-b914-4236-bffe-4e136600cb93", "categoryName": "Sports"}	desktop	Noida	India	2026-08-23 07:27:11.364
46e139f5-0a5c-4223-a559-90a7da454794	product_card_click	/products	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Noida	India	2026-08-23 07:27:12.397
9fa8a439-75b1-4de3-a1c5-5ede0cf5e39e	page_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"path": "/products/d8d66d2c-80c2-4359-9195-046a6bd0436d"}	desktop	Noida	India	2026-08-23 07:27:12.42
01d4e5b1-ed0f-46f0-9cfb-b8c306f2f61d	product_view	/products/d8d66d2c-80c2-4359-9195-046a6bd0436d	{"productId": "d8d66d2c-80c2-4359-9195-046a6bd0436d", "productName": "Sports tee", "categoryName": "Sports"}	desktop	Noida	India	2026-08-23 07:27:12.481
6dec99d3-20ca-43d6-a661-80abe076630f	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:27:14.001
51164e78-2d68-4fb3-82a2-c80f5594b7a5	product_card_click	/	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-23 07:27:16.774
5c3aebf8-80e0-4f87-9e00-87e8b2900f1c	product_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"productId": "d855cbb9-366c-4c40-b6f6-198dccb08934", "productName": "Oversized Tee Bio-Wash.", "categoryName": "College T-Shirts"}	desktop	Noida	India	2026-08-23 07:27:16.833
20f4ef70-086b-4692-9e28-461ca616b266	page_view	/products/d855cbb9-366c-4c40-b6f6-198dccb08934	{"path": "/products/d855cbb9-366c-4c40-b6f6-198dccb08934"}	desktop	Noida	India	2026-08-23 07:27:16.837
f3fd859f-a07e-4b3b-a327-c3bf1e14ab57	page_view	/	{"path": "/"}	desktop	Noida	India	2026-08-23 07:27:18.122
da9a653f-aea5-4db8-93c9-85a1c4aa9b7a	page_view	/	{"path": "/"}	desktop	Cupertino	United States	2026-08-23 08:46:40.944
13e62964-d1b8-4978-8830-81376bfd8eed	page_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"path": "/products/96f47051-f9da-4581-a78e-0202647f9117"}	mobile	Yerevan	Armenia	2026-08-23 14:28:27.683
934a56cc-f055-42f9-b8ca-664573d77587	product_view	/products/96f47051-f9da-4581-a78e-0202647f9117	{"productId": "96f47051-f9da-4581-a78e-0202647f9117", "productName": "Round Neck Cotton", "categoryName": "Corporate"}	mobile	Yerevan	Armenia	2026-08-23 14:28:27.689
d58d55d5-4a2e-49fb-9b87-455cb483efeb	page_view	/	{"path": "/"}	desktop	Mountain View	United States	2026-08-23 16:28:57.359
9ee50344-c8fb-4186-a747-5da7c35fd8a6	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-23 16:35:38.42
733e849e-6552-455c-9e39-f06a958b7d83	page_view	/	{"path": "/"}	desktop	Quincy	United States	2026-08-24 02:05:18.771
8cc6694f-35ec-42b0-af83-35dafd8ed8dd	page_view	/	{"path": "/"}	desktop	Altoona	United States	2026-08-24 07:02:24.021
7e326319-85aa-4d73-9040-5f0644531f0a	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-24 11:14:38.297
be417cd0-5871-48e0-a864-a87dca579079	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-24 12:19:18.761
3c284b71-f2fc-4d50-ac9e-58ea7b5a8677	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-24 12:19:18.896
93743579-9383-4d2d-a76f-0d76c19584ff	product_card_click	/products	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-24 12:19:36.953
db53ac14-cbaf-40eb-ab3b-751c3abaf787	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	New Delhi	India	2026-08-24 12:19:36.966
f47b5f87-df7b-4963-b089-4e58ec34ec31	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-24 12:19:36.979
fc8208d2-c96a-4aed-8a71-522efccc7946	page_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"path": "/products/c8878bc6-c448-44c0-b075-a98745a44eaa"}	desktop	New Delhi	India	2026-08-24 13:07:08.035
90d5da73-2bae-49ff-bc97-2ef3d027177b	product_view	/products/c8878bc6-c448-44c0-b075-a98745a44eaa	{"productId": "c8878bc6-c448-44c0-b075-a98745a44eaa", "productName": "Round Neck 111", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-24 13:07:08.072
fcdf69e8-7708-452d-998f-7a4d7910003f	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-08-25 01:01:06.066
d9235185-1231-48d7-848d-c34a55c0ad07	page_view	/products	{"path": "/products"}	mobile	Mountain View	United States	2026-08-25 01:29:20.5
c12ae1be-182e-4e66-96e8-82575c071ee0	page_view	/	{"path": "/"}	desktop	Hyderabad	India	2026-08-25 07:48:33.97
2ac9539e-6014-4a26-b8bc-63041c0fd8ae	page_view	/	{"path": "/"}	desktop	Pune	India	2026-08-25 07:49:14.476
f1796381-351b-4e22-ad91-0ffaaffcb225	page_view	/products	{"path": "/products"}	desktop	Pune	India	2026-08-25 07:51:11.892
ac76f81f-a7c1-4502-a683-3f7dae1900b7	page_view	/products	{"path": "/products"}	desktop	Pune	India	2026-08-25 07:51:11.896
e1f3f7f0-f90a-4a13-85a3-1119b06d9f66	page_view	/products	{"path": "/products"}	desktop	Pune	India	2026-08-25 07:51:11.902
38da956d-d62b-44c3-b77f-3c959214b54d	page_view	/	{"path": "/"}	desktop	Thrissur	India	2026-08-25 07:53:02.064
912382a7-2c81-49b1-9c21-1853762e1cf5	page_view	/	{"path": "/"}	mobile	Mountain View	United States	2026-08-25 08:15:31.438
e8e1a14c-f993-421c-a5c2-3378bb4c0565	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-25 09:53:08.167
1d8454c5-5bc5-4942-8d68-98f6ffdfac23	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-25 09:53:11.038
9664999d-b2fd-4e66-95f4-4a2fe9a73184	product_card_click	/products	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-25 09:53:16.911
57eef84f-7487-47f2-bba8-49ae0525afdd	page_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"path": "/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba"}	desktop	New Delhi	India	2026-08-25 09:53:16.93
f12d78ed-b064-41b9-af28-10f81c755bf8	product_view	/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	{"productId": "bd17ea99-b858-4b1a-bf9d-3aa9934c25ba", "productName": "Kids Round Neck", "categoryName": "Custom T-Shirts"}	desktop	New Delhi	India	2026-08-25 09:53:16.935
defebeaf-d6a4-4c01-b7ee-0ce610d44b5e	page_view	/products	{"path": "/products"}	desktop	New Delhi	India	2026-08-25 09:53:42.962
fb14e071-d1d9-42fb-8abc-bf238465b401	page_view	/	{"path": "/"}	desktop	New Delhi	India	2026-08-25 09:53:46.818
0e48bd51-5072-4d47-8ba1-357bdbc11a93	page_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"path": "/products/13c4f972-e7f5-47e4-a95e-958d831f5c09"}	mobile	Mountain View	United States	2026-08-25 10:45:38.42
15bdc1eb-e686-4856-ae69-48f9f4d92910	product_view	/products/13c4f972-e7f5-47e4-a95e-958d831f5c09	{"productId": "13c4f972-e7f5-47e4-a95e-958d831f5c09", "productName": "Round Neck 115", "categoryName": "Custom T-Shirts"}	mobile	Mountain View	United States	2026-08-25 10:45:42.428
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.categories (id, name, description, view_order, is_active, created_at, updated_at, badge, image, audience) FROM stdin;
7503fab7-02bd-451d-a24d-7fde13ef86b2	Corporate	Premium bulk T-shirts for corporate branding, employee uniforms, company events and gifting. Logo printing available. Trusted by 500+ companies.	1	t	2026-04-11 04:55:24.309	2026-08-14 14:28:32.401	\N	images/categories/7503fab7-02bd-451d-a24d-7fde13ef86b2/corporatet-shirts-1777234302618-544960-1786717712372-841795.jpeg	UNISEX
9fd54e76-cd1d-42a5-8f18-da7436e5f157	College T-Shirts	Trendy batch tees, farewell shirts, cultural fest merchandise and graduation custom prints. Most popular with student committees and college fests.	4	t	2026-04-11 04:55:24.316	2026-08-14 14:28:32.435	\N	images/categories/9fd54e76-cd1d-42a5-8f18-da7436e5f157/colleget-shirts-1777234398120-267771-1786717712403-15089.jpeg	UNISEX
6fd9b1f3-fd31-475b-8924-3144cdd34c86	Custom T-Shirts	Fully customisable T-shirts with your logo, design, colour and quantity. Ideal for startups, NGOs, events and brand merchandise. MOQ: 50 units.	5	t	2026-04-11 04:55:24.318	2026-08-14 14:28:32.47	\N	images/categories/6fd9b1f3-fd31-475b-8924-3144cdd34c86/customt-shirts-1777234412695-379648-1786717712437-810809.jpeg	UNISEX
bb08cb41-b914-4236-bffe-4e136600cb93	Sports	High-performance moisture-wicking tees for sports teams, marathons, tournaments and fitness clubs. Lightweight, breathable and sweat-resistant.	2	t	2026-04-11 04:55:24.312	2026-08-14 14:28:32.507	\N	images/categories/bb08cb41-b914-4236-bffe-4e136600cb93/rrb0yxkxfy73-eqrf3lvoupu4-uupl7fzwcfmsnprhtv-agat3jphrnqzmisqfwtcq3-tyv8dhhpo-htwwi688ii1ww1eq8n-oki2occg4appdnm5ipggyou-udqb7q91ilwzr5j6ujmcwsmopkocioqebmybo-dxrj4-osmz0vwv-8umilcfdk7p88hcgl-1777974492015-395922-1786717712472-291638.jpg	UNISEX
08652fc9-65c6-4743-9ae6-fc9111a5a828	School Uniforms	Durable, colourfast and comfortable T-shirts built for daily school wear. Pre-shrunk fabric, consistent sizing and bulk pricing for institutions.	3	t	2026-04-11 04:55:24.314	2026-08-14 14:28:32.54	\N	images/categories/08652fc9-65c6-4743-9ae6-fc9111a5a828/schooluniformstshirt-1777234376516-275716-1786717712509-576764.jpeg	KIDS
\.


--
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.enquiries (id, name, phone, email, message, product_id, status, reply, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fabric_types; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.fabric_types (id, name, description, is_active) FROM stdin;
ce12a47a-b20d-422d-b2a2-cbf174a7c573	Cotton (100% Cotton)	Pure ring-spun cotton — the most popular choice. Soft, breathable and skin-friendly. GSM range: 160–220. Ideal for all-day wear and branding prints.	t
a132405d-7a9e-4418-ad38-18b5cf82aeba	Bio-Wash Cotton	Cotton treated with bio-enzymes for an ultra-soft, silky finish. Reduces pilling, maintains colour vibrancy wash after wash. Perfect for premium gifting.	t
6b503c95-583b-4019-a6d3-80444f67607a	Polyester	Durable 100% polyester with excellent colour retention for sublimation and digital prints. Wrinkle-resistant and quick-drying. GSM range: 130–180.	t
acb38714-a092-4bd5-98fe-453eb022133e	Dry-Fit (Sports Polyester)	Advanced moisture-wicking polyester that pulls sweat away from the body. Lightweight, breathable and fast-drying. The go-to for sports and fitness.	t
e499350a-5f65-4bde-bf4d-a9753328280d	Cotton Blend (Poly-Cotton)	60% cotton + 40% polyester — the best of both worlds. Comfortable like cotton, durable like polyester. Budget-friendly and less prone to shrinkage.	t
cfca30fe-cb9e-4df9-b969-f21daa6fdcf0	Lycra / Stretchable	Cotton with 5–10% Lycra/spandex for 4-way stretch. Ideal for fitted styles, activewear and uniforms that need freedom of movement.	t
1032ff4f-0806-43ba-ab4c-90431e87bc7c	Terry Cotton	Heavyweight loop-knit cotton fabric with a thick, plush feel. Premium choice for oversized tees, winter editions and luxury merchandise.	t
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, size, price_per_unit) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.orders (id, order_number, customer_name, customer_phone, customer_email, status, total_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pricing_slabs; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.pricing_slabs (id, product_id, min_quantity, max_quantity, price_per_unit) FROM stdin;
d11264a6-be50-4d78-98eb-070293e8db46	7c2c6b9a-c387-4de3-81be-508d540904a3	50	99	220.00
613316a1-4dcd-4b9e-a943-65d13ebf17c0	7c2c6b9a-c387-4de3-81be-508d540904a3	100	499	180.00
6e0036f7-f95b-4c2e-b15b-b22d1b6d273c	7c2c6b9a-c387-4de3-81be-508d540904a3	500	\N	150.00
09237de4-dfea-4544-a88c-a393d27a4fe4	d8d66d2c-80c2-4359-9195-046a6bd0436d	50	99	330.00
98901dcd-f9c4-459b-a587-93ca87e8bebf	d8d66d2c-80c2-4359-9195-046a6bd0436d	100	499	300.00
7ab4a280-8fa0-4dff-86d7-ffa470539a92	d8d66d2c-80c2-4359-9195-046a6bd0436d	500	\N	270.00
e1509d53-70bb-4de7-81bc-d9f642a4d2a6	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	50	99	300.00
d1981f06-e47c-4dcf-a4f3-ea96f1e21b7e	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	100	499	280.00
e17727b0-8ac9-4d24-8426-1c9c1a731398	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	500	\N	260.00
3b321987-200d-4fc9-abcb-643a2baa241d	c8878bc6-c448-44c0-b075-a98745a44eaa	50	99	75.00
aee55d8e-aac2-4900-9338-56cfbe05940d	c8878bc6-c448-44c0-b075-a98745a44eaa	100	499	65.00
9a13ddb6-9a97-4dd4-b62d-a9ea12f59c9c	c8878bc6-c448-44c0-b075-a98745a44eaa	500	\N	55.00
cfa47c0f-6302-4d11-bc2c-50ccf6f75797	0b38413f-5524-4478-bdf6-83f25eff1427	50	99	280.00
c38f3c0e-c42a-4d9e-b01a-354d7dd6dedd	0b38413f-5524-4478-bdf6-83f25eff1427	100	499	260.00
1bd5baa4-72df-4b0f-9b29-8e390c637263	0b38413f-5524-4478-bdf6-83f25eff1427	500	\N	240.00
0c02f67a-13a5-49b9-8fd2-fbab093f00ad	348e50a4-14e3-4179-a873-38e305687fdd	50	99	390.00
743f3285-6a48-4099-a0c5-c3e23ef2a317	348e50a4-14e3-4179-a873-38e305687fdd	100	499	380.00
7cf51312-e3c5-4624-b71a-ac23f7f30d69	348e50a4-14e3-4179-a873-38e305687fdd	500	\N	370.00
649a230c-62ae-4b90-bc93-f8051d92bd78	9ac310be-2d6d-471e-a919-f603da96c569	50	99	280.00
79e2d310-7c7e-45ec-a66f-a711dbe5d2ed	9ac310be-2d6d-471e-a919-f603da96c569	100	499	240.00
ce4db33c-6e9b-4b21-895e-46b22383f2b6	9ac310be-2d6d-471e-a919-f603da96c569	500	\N	220.00
bf8c6556-95ec-419f-bef6-3fe60ca0f25a	f05883de-2d1f-41b5-b06f-f4154461aede	50	99	280.00
c5b29cab-215d-407f-93ad-53f2a1f4051a	f05883de-2d1f-41b5-b06f-f4154461aede	100	499	260.00
099effd3-c699-4bbd-aa62-9fe47b0cc49b	f05883de-2d1f-41b5-b06f-f4154461aede	500	\N	240.00
fdc06650-5e66-49f4-a5f4-4e3ac39eab7b	3a088ad2-1312-45b0-8a3d-bbb252599f9f	50	99	105.00
96a35c76-330a-49c1-9a6d-63bafc0de6cb	3a088ad2-1312-45b0-8a3d-bbb252599f9f	100	499	95.00
dc77953a-bcad-43c6-97df-ea11fed91eae	3a088ad2-1312-45b0-8a3d-bbb252599f9f	500	\N	85.00
f5f322ab-407f-405c-b9a6-4ae0399f6767	d855cbb9-366c-4c40-b6f6-198dccb08934	50	99	210.00
ccd84f67-4602-424e-b41e-08049bdfa682	d855cbb9-366c-4c40-b6f6-198dccb08934	100	499	200.00
42d7c5ba-f715-4bf7-bad1-e6d73dec71ec	d855cbb9-366c-4c40-b6f6-198dccb08934	500	\N	190.00
1016ebcd-fdee-49ab-9681-35d6f2911868	96f47051-f9da-4581-a78e-0202647f9117	50	99	165.00
c46f3a4c-48e9-442e-a2e2-cb8ff11d8048	96f47051-f9da-4581-a78e-0202647f9117	100	499	155.00
1952db63-b8db-4f1d-bbee-2a06f7565d59	96f47051-f9da-4581-a78e-0202647f9117	500	\N	145.00
a3dce1e1-bea8-4e0a-9cea-8a45eab477e3	b3189385-9ff5-47db-b2f7-a0e2f62599ef	50	99	130.00
c11e0a1f-8921-43fa-bd0b-72ec8954b6a6	b3189385-9ff5-47db-b2f7-a0e2f62599ef	100	499	120.00
3320019e-b46a-4601-ab7b-170033fb0e60	b3189385-9ff5-47db-b2f7-a0e2f62599ef	500	\N	110.00
d379f884-91c2-4ff9-9d91-6fa23ef52d67	d0163b49-520e-46c2-bdf2-a845eb71ec17	50	99	220.00
f408a2cf-7bc1-4e7f-ba8d-e0939b636ca3	d0163b49-520e-46c2-bdf2-a845eb71ec17	100	499	200.00
768dc9d0-6ead-4b6a-a2dc-843178e841b8	d0163b49-520e-46c2-bdf2-a845eb71ec17	500	\N	190.00
7d022869-90c7-4763-9713-a463923ee37c	8ba2803a-79bc-44d8-a196-3b9c908ee53a	50	99	85.00
f1f8d656-2616-463f-b5a6-51be1410d491	8ba2803a-79bc-44d8-a196-3b9c908ee53a	100	499	75.00
2f40b716-6a45-48ee-b2ac-b62037ceffb0	8ba2803a-79bc-44d8-a196-3b9c908ee53a	500	\N	65.00
e65c29c6-4ab6-4344-8323-57b7e6db57b0	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	50	99	105.00
42af8ff8-c53e-48cf-aff8-4c6fb5ff65dd	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	100	499	95.00
db92e86e-3158-4fd0-8f15-926640791b39	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	500	\N	85.00
76c60279-69c1-4980-ad1a-a0d82e5babb7	5bc3c681-3786-441f-9b28-f60429b93ca1	50	99	285.00
1f991b59-1bc5-4e3f-9f18-44b9002ae6cb	5bc3c681-3786-441f-9b28-f60429b93ca1	100	499	275.00
ccf7bc50-69cf-427c-9b5b-0ffc27ba9ea8	5bc3c681-3786-441f-9b28-f60429b93ca1	500	\N	265.00
9d65a9d7-8644-4439-affc-eeb0a4e5d0fd	737156d2-71fc-409e-ac15-8467beeafb7d	50	99	100.00
9f453c65-6ec7-4c5c-b3da-7513db209e65	737156d2-71fc-409e-ac15-8467beeafb7d	100	499	90.00
5ab49029-7c51-4c57-94ba-c0b364360053	737156d2-71fc-409e-ac15-8467beeafb7d	500	\N	80.00
70d0ee1c-fe19-453a-a242-fd44b4168fe4	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	50	99	165.00
bc0a46de-18df-46b9-a0d1-08e6d4c080d8	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	100	499	145.00
3221d256-9d20-46ed-8de5-8481424cae49	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	500	\N	125.00
901bb68a-e236-4d34-bb5b-a7ac299ccbbd	f7937fc0-24c3-4087-874a-472e78047ecd	50	99	220.00
d7a03f00-cf04-4289-963f-c42345fe8610	f7937fc0-24c3-4087-874a-472e78047ecd	100	499	200.00
0594a1cb-142e-40c1-a747-a7c6aa79241f	f7937fc0-24c3-4087-874a-472e78047ecd	500	\N	180.00
5d450d5f-95c4-40a8-8ec4-86b770489855	13c4f972-e7f5-47e4-a95e-958d831f5c09	50	99	95.00
769dcfcb-a73a-41a6-8552-05a362f11288	13c4f972-e7f5-47e4-a95e-958d831f5c09	100	499	85.00
4d2e4deb-b366-45f8-881f-191c918fc0c9	13c4f972-e7f5-47e4-a95e-958d831f5c09	500	\N	75.00
31efbca6-a500-4670-883c-b65299d17239	89c9d036-8a2d-45a4-97d2-05ea9051a67c	50	99	94.00
58b89e22-5fc0-46f5-9585-4d862c91b2a2	89c9d036-8a2d-45a4-97d2-05ea9051a67c	100	499	84.00
485b9271-841d-4129-aa70-0090682df7aa	89c9d036-8a2d-45a4-97d2-05ea9051a67c	500	\N	74.00
d1d80a10-8484-4104-bbc6-566185f39c13	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	50	99	150.00
29b6d854-e2bc-4c23-ad0d-b91bc31f7d8d	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	100	499	140.00
49fa2f57-ffd1-4da8-8846-125aff67e201	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	500	\N	130.00
f6e01343-f8eb-4a57-8897-5f75ce055e2e	4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	50	99	95.00
80e98828-174b-4bda-a47a-e3d0161f6eaf	4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	100	499	85.00
585df54d-9cae-4987-9487-cc57d16de306	4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	500	\N	75.00
ccd85540-830f-4dee-b4bf-d3545150d324	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	50	99	250.00
1b1f026c-064d-47cd-9a85-1b6c40c946cf	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	100	499	270.00
6c4532cf-eb73-4c87-8caf-4367dfce47bd	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	500	\N	290.00
d60f057e-c62e-4086-85ab-ea4924daa6d8	a44ba47b-5947-4c24-bd37-16a336bd4057	50	99	150.00
3e435ef3-0f41-4d64-9d24-0e059e63c9af	a44ba47b-5947-4c24-bd37-16a336bd4057	100	499	140.00
909d2d4b-2c94-475f-94fd-a7c900852508	a44ba47b-5947-4c24-bd37-16a336bd4057	500	\N	130.00
8bb252a8-8067-4199-9678-d377ee87728e	ff911850-c0bb-46ab-96e1-0d40fc368bbd	50	99	335.00
b6772ea4-87e9-45e7-a693-29d810e73cc0	ff911850-c0bb-46ab-96e1-0d40fc368bbd	100	499	325.00
9d88f02a-f4c1-4101-90df-f6c9e61c4862	ff911850-c0bb-46ab-96e1-0d40fc368bbd	500	\N	315.00
1fd619bf-844a-4f15-aaf3-6275201f7ded	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	50	99	220.00
b8a525b9-c714-43f1-892d-ef1e1c3a02f9	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	100	499	200.00
eae0810a-774a-43ef-8b75-41754434f415	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	500	\N	180.00
399a53a0-1ddf-442f-aaca-d7390ea7a3ae	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	50	99	160.00
839b7ee6-5fe4-4ad1-8823-2709524a6e06	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	100	499	150.00
35c90bc8-e11c-48a3-b08a-bb916fc8e862	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	500	\N	140.00
6d8f85cf-72f1-4741-8e65-912342a0d9dc	d18abd68-8383-44c8-93eb-a15fbe77ab15	50	99	180.00
d6281739-5105-4f7a-8313-b41972d04109	d18abd68-8383-44c8-93eb-a15fbe77ab15	100	499	170.00
3ec15118-f1f6-4687-9cae-46fa27aa3d5e	d18abd68-8383-44c8-93eb-a15fbe77ab15	500	\N	160.00
a88c270f-9684-4334-b3b6-fac83ad1f8a4	d7ee7563-6263-433f-bced-e37fdf1797b8	50	99	220.00
8aafb6eb-2ae2-441b-b9fe-80fe1d138889	d7ee7563-6263-433f-bced-e37fdf1797b8	100	499	210.00
77dd99ec-5236-4961-bddc-a32b025684fe	d7ee7563-6263-433f-bced-e37fdf1797b8	500	\N	200.00
cd648716-43a4-41b6-bd8f-ed6fe3d4320a	332a089c-172c-4108-b3f7-46b4d6d463ca	50	99	180.00
f14c979b-5174-4dc7-a3a6-ec708f6cc333	332a089c-172c-4108-b3f7-46b4d6d463ca	100	499	170.00
a17277d4-b53f-4b62-b455-b684c8305dd3	332a089c-172c-4108-b3f7-46b4d6d463ca	500	\N	160.00
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.product_images (id, product_id, image_url, alt_text, sort_order) FROM stdin;
483ac5d9-ed9f-4028-b54d-c9ed0a963d24	7c2c6b9a-c387-4de3-81be-508d540904a3	https://placehold.co/800x800/1e40af/ffffff?text=Corporate+Round+Neck	Corporate Round Neck front view	0
9f7030bf-5b71-41f2-9fe7-1d9854dd9555	7c2c6b9a-c387-4de3-81be-508d540904a3	https://placehold.co/800x800/3b82f6/ffffff?text=Round+Neck+Back	Corporate Round Neck back view	1
cd349c4d-8b4e-4ec1-8249-472c9e6c79e2	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776428133135-231975-1786717704583-116424.png	\N	4
70a9e71a-9b82-4f54-ae84-b57e4edc266e	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776428133136-941876-1786717704626-823345.png	\N	5
962327f4-e99a-49c9-8a42-1afd546cfcee	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	images/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03/1776586335549-828376-1786717704710-686257.png	\N	0
fd275aea-0e79-46f0-aaba-c92e28d97249	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	images/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03/1776586335555-262459-1786717704747-506191.png	\N	2
1c40915e-7013-4418-9e63-82a776f3de58	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	images/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03/1776586335557-611891-1786717704821-94555.png	\N	4
9f93f708-2938-4e4e-950c-929e50df540f	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	images/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03/1776586607089-60032-1786717704869-689711.png	\N	5
482b4ad4-e8d6-4b85-b2fa-c5007ebf95d5	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422715-11122-1786717704956-178655.png	\N	1
1c0d9c2e-7e58-4e2a-8af4-71b1bc2e477d	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422722-164999-1786717704993-727970.png	\N	5
7b17189d-ece4-4bfb-8fa3-662f5115c407	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422723-695558-1786717705088-636508.png	\N	6
377f7bdb-805a-4eab-b39d-d83bbbc25fdb	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422719-438666-1786717705130-835397.png	\N	4
d9c0412f-c59e-409c-a051-1f3c7ee9e416	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585481-958873-1786717705215-688207.png	\N	1
8ff21caf-2728-4d66-9fcb-bc29b632918d	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326941-665049-1786717705254-327120.png	\N	0
49ef194f-c688-4d13-9a47-3bc98031d6ef	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326950-870741-1786717705333-774095.png	\N	6
a279d18e-6f49-4a31-8635-e82ec7b3d867	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776088212129-710267-1786717705370-126924.png	\N	0
638838b8-86b3-406a-9fe6-3578ac9f1b7d	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	images/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba/1776174683195-865070-1786717705505-909924.png	\N	4
838989c7-2c3c-4eef-975f-f4da4e75eb9e	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	images/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba/1776174683190-59125-1786717705560-958305.png	\N	3
4614f9d6-1ad0-474f-ab6d-906f7d67d7ed	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	images/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba/1776174683184-705631-1786717705676-482252.png	\N	2
fb1302c8-e051-4b06-be39-0920d3470185	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776181372362-953582-1786717705729-968856.jpg	\N	1
9f77bc69-7ea0-4023-be25-5f9d4d7b4cd6	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776242304688-438184-1786717705843-130807.jpg	\N	3
e96b9ccf-4545-45ee-be1b-dd8bbb8eec49	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776243726429-683994-1786717705954-543285.jpg	\N	5
c86899c9-aa52-4d2f-a0d2-dba92dfa2f68	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776244709542-115817-1786717706007-316441.jpg	\N	6
4c970aca-d4ef-479d-8fd7-0b5dc61ebc0b	d0163b49-520e-46c2-bdf2-a845eb71ec17	images/products/d0163b49-520e-46c2-bdf2-a845eb71ec17/1776253918869-778588-1786717706136-254841.jpg	\N	0
fb85777e-3e73-4571-b017-69db95d1d42b	d0163b49-520e-46c2-bdf2-a845eb71ec17	images/products/d0163b49-520e-46c2-bdf2-a845eb71ec17/1776253997266-807966-1786717706189-470482.jpg	\N	2
ce6c4b75-c8c1-4319-870b-c5bf24e26b74	d0163b49-520e-46c2-bdf2-a845eb71ec17	images/products/d0163b49-520e-46c2-bdf2-a845eb71ec17/1776253997270-67147-1786717706301-985940.jpg	\N	3
132b7724-f032-4f47-80df-e1d1f7d46600	d0163b49-520e-46c2-bdf2-a845eb71ec17	images/products/d0163b49-520e-46c2-bdf2-a845eb71ec17/1776254463657-858740-1786717706357-632799.jpg	\N	4
c9d6862d-9162-4c90-9a51-b05b8ee58514	d0163b49-520e-46c2-bdf2-a845eb71ec17	images/products/d0163b49-520e-46c2-bdf2-a845eb71ec17/1776320883839-794621-1786717706445-981976.png	\N	5
e3d01993-906f-4c25-acc1-600f617f3bee	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776322589556-474065-1786717706481-391504.png	\N	2
52768004-4a02-4c10-b409-7d415763fef6	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776323236470-22564-1786717706556-111422.png	\N	5
d176f504-affe-4d0e-8b3d-f760a092de59	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776323236469-402689-1786717706595-485022.png	\N	4
09cbbaed-fb7a-40f5-9d59-cd3f1540293d	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776331742589-724877-1786717706671-375917.png	\N	7
292f75f2-2a98-4fee-89fc-8d6557392605	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348000-848416-1786717706702-150371.png	\N	1
222ef4b8-5898-406b-9763-03a01130c1c9	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348001-397164-1786717706769-779543.png	\N	2
9c1bbefc-f5d5-4bcf-9924-571b09217998	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348002-233526-1786717706806-867343.png	\N	3
b66d9720-9722-450c-b983-d1a26b2ce677	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407347999-826898-1786717706880-620536.png	\N	0
5add88db-3405-4b0d-89cd-26fbcfa8de4d	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348004-954315-1786717706913-895230.png	\N	5
3b3c99b8-5b4d-4b17-ba8f-3989e622bd9e	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219721-806711-1786717707026-330627.png	\N	1
9365e244-c533-4d17-a753-640743f8be7b	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219726-525200-1786717707064-201528.png	\N	6
a21d7352-4ceb-42c7-ba2e-b8c16843bb44	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219724-827435-1786717707131-37348.png	\N	4
ead4733c-42fa-474c-8134-6caa3cf5096f	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219725-116165-1786717707165-93746.png	\N	5
a6ec0abc-8701-4d2a-acbd-c70251619ba9	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776428133104-655396-1786717707232-783613.png	\N	0
412b2fe2-28b7-4112-a7fc-a6326ae5bbcb	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	images/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048/1776417696592-197642-1786717707271-878975.png	\N	0
b5f1a988-f459-4b87-b54a-961816fb9a47	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	images/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048/1776417696598-975068-1786717707389-676041.png	\N	3
22f6c420-a8cf-4ef6-9b4d-b8fa83a617df	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	images/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048/1776417696596-262015-1786717707429-339561.png	\N	2
3a4b19f5-00f2-4c41-a7c2-ec71e3b252c0	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	images/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048/1776417696600-487493-1786717707513-945240.png	\N	4
835ccd0b-4267-4f04-92f4-60ef8218e0ef	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	images/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03/1776586335552-272163-1786717707588-364533.png	\N	1
bca4d2d9-b23e-46da-965e-7c94986591e9	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776586938888-127443-1786717707631-97042.png	\N	6
35d01866-1b16-4605-b9ec-3d7e39a6c41c	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422713-989551-1786717707727-850569.png	\N	0
bb0f3a5c-e5a8-4822-9a72-05e4cb7e18f7	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585477-979043-1786717707767-716460.png	\N	0
d8795255-4629-4df2-a4f8-e0ef04b3984e	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585483-217231-1786717707860-902733.png	\N	3
ed52847f-f695-423a-8ffa-ceba33bca960	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585489-528547-1786717707906-626508.png	\N	6
c6594a33-c9ed-4fa7-b5fe-fca3ed067811	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585485-446833-1786717707993-763679.png	\N	4
857656a4-1b4c-45ba-8f15-28f5c9211907	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326945-40937-1786717708034-114755.png	\N	2
c041fe1e-06ef-4b32-93e7-02121433fa3f	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326947-121021-1786717708114-586943.png	\N	4
5136ddde-95b3-4de4-bc40-bb3bc73d39a5	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365808-98265-1786717708188-894444.png	\N	0
ee3bc075-325b-47b3-83e2-82b99ccb4c3b	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365814-525030-1786717708225-588623.png	\N	5
55ce7d6f-a502-4e7d-8d72-9bf6ffd36f23	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365811-737087-1786717708369-688535.png	\N	2
1df0993c-dfca-49e6-b5dd-ad0b97d80caa	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365812-483275-1786717708404-864925.png	\N	3
d7d6ad23-f212-4e86-9f34-831d5c6e2860	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365810-107475-1786717708477-948696.png	\N	1
73e97844-6b56-4c2b-b33c-3c6ebd3bbe6d	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387166-840072-1786717708519-847088.png	\N	0
a3c4930c-ebb6-454c-950b-ca070a90b59a	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387171-455463-1786717708604-932255.png	\N	3
cbb4b5c9-fc9f-41c7-bd30-fd84df758697	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387172-454660-1786717708643-330472.png	\N	4
9d425b2a-2387-46a5-96e4-37720e199cde	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387169-127252-1786717708728-673791.png	\N	2
1fc0b02a-a1e4-4684-bccc-35f8ba24e04b	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387195-122320-1786717708770-378891.png	\N	6
fe044ff1-bdee-48bf-9e7b-06317c7b91b8	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776862803993-210367-1786717708853-373614.png	\N	1
6b06e732-5f9e-46db-ba3f-0db2d46770c9	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776862803996-211398-1786717708944-877156.png	\N	3
d42851c1-e03e-4573-94b0-9ea95be81bbb	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776862803998-103527-1786717708982-419112.png	\N	4
490d4139-4a02-4c54-a657-f0c6ec9f9924	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776862804000-830726-1786717709079-153862.png	\N	5
fda07b1a-dbd7-4c62-b9a3-0f9b0c1a2913	c8878bc6-c448-44c0-b075-a98745a44eaa	images/products/c8878bc6-c448-44c0-b075-a98745a44eaa/1777030467528-554020-1786717709121-654157.png	\N	0
f4108c02-da1a-44e0-80e5-62d12f1c3e8e	c8878bc6-c448-44c0-b075-a98745a44eaa	images/products/c8878bc6-c448-44c0-b075-a98745a44eaa/1777030467530-94274-1786717709204-615785.png	\N	1
94f4a838-b1ce-4f81-b3cb-64690ec47990	c8878bc6-c448-44c0-b075-a98745a44eaa	images/products/c8878bc6-c448-44c0-b075-a98745a44eaa/1777030467531-631999-1786717709241-791767.png	\N	2
29b80278-1600-46b4-be44-cff07a14b999	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245911-920959-1786717709308-475654.png	\N	0
ec8ddee7-49b9-4ce6-8dce-286f4c17a96d	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245922-911414-1786717709355-752297.png	\N	7
c21699c5-ee90-431a-bee1-df3f15f28c33	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245918-615601-1786717709468-131169.png	\N	4
9783bdf0-6191-46cf-bd41-2b23a918f4a2	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245920-772554-1786717709506-672820.png	\N	6
68a2768e-0440-478e-a4a7-9ce96923510b	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245913-887263-1786717709585-132564.png	\N	1
8faf9a13-483a-4601-b6f5-3df6fa2c482e	737156d2-71fc-409e-ac15-8467beeafb7d	images/products/737156d2-71fc-409e-ac15-8467beeafb7d/1777291501461-731466-1786717709629-363566.png	\N	0
9f5935ce-4a9c-4d82-a526-c3268bfe8d1e	737156d2-71fc-409e-ac15-8467beeafb7d	images/products/737156d2-71fc-409e-ac15-8467beeafb7d/1777291501477-38415-1786717709707-124255.png	\N	3
db451186-ef64-4f46-a47e-e42fa46d9756	737156d2-71fc-409e-ac15-8467beeafb7d	images/products/737156d2-71fc-409e-ac15-8467beeafb7d/1777291501482-817611-1786717709747-376389.png	\N	4
a517364d-83d1-4ee5-ab91-7fbc9d62fbcd	737156d2-71fc-409e-ac15-8467beeafb7d	images/products/737156d2-71fc-409e-ac15-8467beeafb7d/1777291501467-443153-1786717709824-224755.png	\N	1
98376006-12fa-4fe0-b3ed-f54059ebfafe	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080517-293869-1786717709916-543043.png	\N	6
7c2de966-ec82-474b-a12f-2a98d6a80ce1	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080500-610597-1786717709958-787126.png	\N	2
3c22fdb3-4f04-4a83-b791-5d2b61d8c5c7	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080508-358053-1786717710049-589126.png	\N	4
4b6c96aa-fb31-425e-b1ef-24feec1e39ff	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080498-207624-1786717710090-786195.png	\N	1
c618c0e8-2d85-4270-b2b9-38c7fa8d4850	13c4f972-e7f5-47e4-a95e-958d831f5c09	images/products/13c4f972-e7f5-47e4-a95e-958d831f5c09/1777297006919-490664-1786717710172-587532.png	\N	0
85cdf7af-7854-4677-a8fa-064d587961db	13c4f972-e7f5-47e4-a95e-958d831f5c09	images/products/13c4f972-e7f5-47e4-a95e-958d831f5c09/1777297006930-488283-1786717710211-641696.png	\N	5
9364b136-3508-4ca6-8e5b-091697a6625e	13c4f972-e7f5-47e4-a95e-958d831f5c09	images/products/13c4f972-e7f5-47e4-a95e-958d831f5c09/1777297006924-666903-1786717710295-276194.png	\N	3
5dbc47f1-5d0e-42aa-9e4f-321dabd60f74	13c4f972-e7f5-47e4-a95e-958d831f5c09	images/products/13c4f972-e7f5-47e4-a95e-958d831f5c09/1777297006921-823002-1786717710330-836399.png	\N	1
dc62f0eb-5add-4b4a-8b40-578b9289679d	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296108-912933-1786717710401-382463.png	\N	0
6e16caec-ff94-49e1-9224-73530cb56922	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296113-371327-1786717710482-963949.png	\N	3
33debceb-77fb-4363-8048-6d64d735009a	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296115-711161-1786717710524-661253.png	\N	4
36a0c007-7e0a-404a-b111-d53d37e79227	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296111-424573-1786717710618-179664.png	\N	2
3a9d2b58-d95f-4a42-beb8-d61276083292	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296116-875881-1786717710672-226666.png	\N	5
5a24af9d-20fa-4dd5-8005-83d4e8c02589	ff911850-c0bb-46ab-96e1-0d40fc368bbd	images/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd/1777309134700-266858-1786717710754-116694.png	\N	5
16d1fe31-a00b-4cbb-b119-d957e10dde43	ff911850-c0bb-46ab-96e1-0d40fc368bbd	images/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd/1777309134698-888759-1786717710794-960468.png	\N	4
ba018c38-8186-485a-a61b-49db0b513bc4	ff911850-c0bb-46ab-96e1-0d40fc368bbd	images/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd/1777309134693-979259-1786717710873-649007.png	\N	2
96e8d18d-d87d-4c11-8adb-d2012ed4113f	ff911850-c0bb-46ab-96e1-0d40fc368bbd	images/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd/1777309134690-700824-1786717710957-358339.png	\N	1
c419eb5e-45d9-4ed2-9bfe-1df631adc843	5bc3c681-3786-441f-9b28-f60429b93ca1	images/products/5bc3c681-3786-441f-9b28-f60429b93ca1/1777310197823-17384-1786717711035-438964.png	\N	2
4d6af794-a5af-414f-b117-b23ec9f5c1da	5bc3c681-3786-441f-9b28-f60429b93ca1	images/products/5bc3c681-3786-441f-9b28-f60429b93ca1/1777310197819-536042-1786717711112-188165.png	\N	0
7072f4aa-6cda-4161-8f2d-3fdef6334f39	5bc3c681-3786-441f-9b28-f60429b93ca1	images/products/5bc3c681-3786-441f-9b28-f60429b93ca1/1777310197825-326633-1786717711151-607311.png	\N	4
c102a784-2c01-4182-9f92-232afbc2507f	b3189385-9ff5-47db-b2f7-a0e2f62599ef	images/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef/1778242469202-57212-1786717711230-999947.png	\N	4
49520eea-c007-4399-8b25-70d832def4be	b3189385-9ff5-47db-b2f7-a0e2f62599ef	images/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef/1778242469200-276279-1786717711269-475928.png	\N	3
166d94b6-ddb2-4c8b-a473-083220193332	b3189385-9ff5-47db-b2f7-a0e2f62599ef	images/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef/1778242469198-988482-1786717711356-485699.png	\N	2
947d0507-8369-4977-8237-c6d8ee26c797	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971132-454190-1786717711395-388570.png	\N	0
51790a17-803f-43d0-9b0b-767518f6de66	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971140-839407-1786717711465-20401.png	\N	6
a2d16bd4-a09e-4425-b88b-803fd61783d0	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971137-662984-1786717711505-23966.png	\N	4
943f51b7-7286-4f20-8695-946f3f4efb1c	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971135-40510-1786717711576-595590.png	\N	2
0526e252-6b94-4b16-a548-c711b8f18af6	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971138-935319-1786717711610-325557.png	\N	5
15ee3ae1-672b-44c2-b3c8-80688d9f1a3b	4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	images/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6/1779777772181-821666-1786717711695-932665.png	\N	1
e04c71ff-3b25-4720-8064-439139e60ab2	a44ba47b-5947-4c24-bd37-16a336bd4057	images/products/a44ba47b-5947-4c24-bd37-16a336bd4057/1781605431994-417645-1786717711738-473186.png	\N	0
ecf2877a-8ac4-41ef-b698-0c7e5ff7416a	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776428133125-310267-1786717704424-808534.png	\N	2
56485343-354b-4247-b810-e56b08846e57	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776428133105-899208-1786717704534-117449.png	\N	1
7aa377ef-49a5-4593-9086-585b3a0fe7a3	f7937fc0-24c3-4087-874a-472e78047ecd	images/products/f7937fc0-24c3-4087-874a-472e78047ecd/1776428133133-244532-1786717704667-631220.png	\N	3
dd1629c3-fee5-42df-8536-6e139f6ebd5c	a6fa9e13-d502-42a4-b37d-0a0b713b5c03	images/products/a6fa9e13-d502-42a4-b37d-0a0b713b5c03/1776586335556-850286-1786717704784-990952.png	\N	3
b9d85380-dfa3-4f86-a754-7e257a34f069	3a088ad2-1312-45b0-8a3d-bbb252599f9f	images/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f/1776588079933-924981-1786717704914-126300.png	\N	0
49633743-b05f-438d-a4d5-4f6e56587875	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422718-17083-1786717705035-658181.png	\N	3
602a8c87-66a9-413b-b69e-a64d7f022509	f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	images/products/f5033457-10b1-4ac9-aca0-a99dcc5e4fb8/1776591422716-483885-1786717705173-590669.png	\N	2
55ee5e94-e13f-42e6-bc9c-fb02b7447790	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326949-360364-1786717705293-939048.png	\N	5
51796880-f797-4ff4-8e92-e70ce9150228	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	images/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba/1776174683165-487227-1786717705449-138478.png	\N	0
508d07ac-28ce-4bfe-ab78-71a43e91819d	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	images/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba/1776174683176-91527-1786717705621-962440.png	\N	1
dd512d4b-63b8-48d2-a3ee-6f264790fbb4	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776182795414-5458-1786717705784-12594.jpg	\N	2
e7d32341-4a40-436f-84a7-25e5f6720491	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776243388028-874292-1786717705903-303999.jpg	\N	4
2998bebd-4928-40cf-abce-cef1233ef183	d7ee7563-6263-433f-bced-e37fdf1797b8	images/products/d7ee7563-6263-433f-bced-e37fdf1797b8/1776244709548-629362-1786717706080-25295.jpg	\N	7
b12da6a5-02bb-4a97-b31d-57df350b7d15	d0163b49-520e-46c2-bdf2-a845eb71ec17	images/products/d0163b49-520e-46c2-bdf2-a845eb71ec17/1776253997261-737763-1786717706242-838556.jpg	\N	1
400f0866-5006-42a9-a22c-96a8309cdf7c	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776320203263-82173-1786717706407-23285.png	\N	0
3977d47b-5890-4555-9fcf-33f242c7d6f1	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776323236468-963149-1786717706517-358372.png	\N	3
90481e99-529a-4913-8230-b82b6b6b4ebd	332a089c-172c-4108-b3f7-46b4d6d463ca	images/products/332a089c-172c-4108-b3f7-46b4d6d463ca/1776331230957-940137-1786717706636-624881.png	\N	6
96f26574-83f9-497d-85b3-d686c63cf7bc	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348006-238183-1786717706737-271888.png	\N	7
9f6285bb-0040-4555-982f-462379ed2b4d	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348003-200157-1786717706843-84811.png	\N	4
5dd54cfc-c9a5-475f-a157-ce6e497c8b74	d18abd68-8383-44c8-93eb-a15fbe77ab15	images/products/d18abd68-8383-44c8-93eb-a15fbe77ab15/1776407348005-490423-1786717706946-571958.png	\N	6
87b50361-fa43-4d77-93de-f4043c325a04	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219720-765049-1786717706984-641391.png	\N	0
121125e6-f467-4aa1-ae54-a77f08be6ab6	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219723-492551-1786717707095-473769.png	\N	3
b2453e29-925a-44c3-af0e-f6b25215be84	a1d9ba42-6745-4613-a8a1-c763ef9bbc71	images/products/a1d9ba42-6745-4613-a8a1-c763ef9bbc71/1776409219722-270620-1786717707200-251706.png	\N	2
085c0515-cf77-46a4-8cf8-618646bb4ccf	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	images/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048/1776417696601-351210-1786717707316-54042.png	\N	5
a7dec73d-082a-4b38-9e87-548818254fbe	7f54851a-dbdc-43a3-9bb5-d7b2b1225048	images/products/7f54851a-dbdc-43a3-9bb5-d7b2b1225048/1776417696593-345258-1786717707469-712450.png	\N	1
046964e6-d8a4-4fb4-9116-b7a401adf371	bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	images/products/bd17ea99-b858-4b1a-bf9d-3aa9934c25ba/1776430050592-81744-1786717707553-530796.png	\N	5
53f40cee-814e-470e-b1af-99a53e3897cb	3a088ad2-1312-45b0-8a3d-bbb252599f9f	images/products/3a088ad2-1312-45b0-8a3d-bbb252599f9f/1776588406643-700564-1786717707696-655704.png	\N	1
9862eef6-b7b9-4fd5-b61b-e12387873280	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585482-913952-1786717707818-879501.png	\N	2
e40f6165-c6d9-40ca-81c2-506ac4938e92	d8d66d2c-80c2-4359-9195-046a6bd0436d	images/products/d8d66d2c-80c2-4359-9195-046a6bd0436d/1776604585487-299726-1786717707953-544969.png	\N	5
d2362e8f-f4a1-43d6-96c2-4d54fbbdfdbd	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326946-38145-1786717708070-324267.png	\N	3
9ff7680e-2030-401c-bd3b-36642bcacb38	a44ba47b-5947-4c24-bd37-16a336bd4057	images/products/a44ba47b-5947-4c24-bd37-16a336bd4057/1781605432017-170455-1786717711873-126858.png	\N	3
b7c77cb6-0b06-4e5e-90e2-c6e8e9f377d5	a44ba47b-5947-4c24-bd37-16a336bd4057	images/products/a44ba47b-5947-4c24-bd37-16a336bd4057/1781605432025-174853-1786717711919-884183.png	\N	4
18cda464-13f7-4bfe-8282-7bdc423e907d	d855cbb9-366c-4c40-b6f6-198dccb08934	images/products/d855cbb9-366c-4c40-b6f6-198dccb08934/1781607564732-418763-1786717712040-26107.png	\N	0
1fc36345-3382-4c98-af42-5c826f3624b8	d855cbb9-366c-4c40-b6f6-198dccb08934	images/products/d855cbb9-366c-4c40-b6f6-198dccb08934/1781607564749-89649-1786717712089-843311.png	\N	2
32c11e2e-8e7e-498f-97c7-7cb59c06143c	d855cbb9-366c-4c40-b6f6-198dccb08934	images/products/d855cbb9-366c-4c40-b6f6-198dccb08934/1781607564757-51158-1786717712200-197975.png	\N	3
6b275919-4e8a-4f37-80ee-3551bebf0c79	f05883de-2d1f-41b5-b06f-f4154461aede	images/products/f05883de-2d1f-41b5-b06f-f4154461aede/1785305442982-958430-1786717712245-277092.jpg	\N	2
116e4c23-560f-41f0-85b8-81869a3d14ae	f05883de-2d1f-41b5-b06f-f4154461aede	images/products/f05883de-2d1f-41b5-b06f-f4154461aede/1785305442982-932169-1786717712303-599655.jpg	\N	1
4ebd3d04-f0f0-4d5b-a44f-0152b9a4b686	f05883de-2d1f-41b5-b06f-f4154461aede	images/products/f05883de-2d1f-41b5-b06f-f4154461aede/1785305484982-757032-1786717712331-800262.jpg	\N	4
6e1901a7-0404-49d0-8919-e0f98bef0756	bdb776f3-6cb6-4da5-b60d-47339af1ceb6	images/products/bdb776f3-6cb6-4da5-b60d-47339af1ceb6/1776843326944-374932-1786717708149-345547.png	\N	1
2a128235-e5bf-49e1-ab27-d0cac9f85095	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365815-818126-1786717708334-801156.png	\N	6
0ce15e01-4b92-4f76-9ceb-b6303747dd87	0b38413f-5524-4478-bdf6-83f25eff1427	images/products/0b38413f-5524-4478-bdf6-83f25eff1427/1776848365813-100311-1786717708440-772651.png	\N	4
371be838-6c7c-491b-a3e8-68533d4f8c6e	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387174-567195-1786717708558-187727.png	\N	5
18da4d28-fd92-4a96-973c-5cfa20af4885	348e50a4-14e3-4179-a873-38e305687fdd	images/products/348e50a4-14e3-4179-a873-38e305687fdd/1776850387168-308630-1786717708686-415997.png	\N	1
97f42c7d-5023-4c7c-ba3b-c5df888ebe24	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776861185540-254137-1786717708806-137876.png	\N	0
745523da-108d-4281-9e26-bd3fb93871c3	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776862804001-437623-1786717708898-67429.png	\N	6
bb21c22b-0359-4bda-84f2-c39d7a37baa6	9ac310be-2d6d-471e-a919-f603da96c569	images/products/9ac310be-2d6d-471e-a919-f603da96c569/1776862803995-925705-1786717709041-235880.png	\N	2
31c59ed4-ee96-44e0-8ed9-80bd3a7986b2	c8878bc6-c448-44c0-b075-a98745a44eaa	images/products/c8878bc6-c448-44c0-b075-a98745a44eaa/1777030467532-348539-1786717709163-809183.png	\N	3
bdc520aa-3105-471a-9244-8eb9874fe7ad	c8878bc6-c448-44c0-b075-a98745a44eaa	images/products/c8878bc6-c448-44c0-b075-a98745a44eaa/1777030467533-407392-1786717709277-731983.png	\N	4
eb36de34-d5ef-4cab-903c-3bfb772fbbe5	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245916-939388-1786717709392-528270.png	\N	3
b2d887c9-1c51-439d-8e9b-19801fda35eb	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245915-752058-1786717709429-319704.png	\N	2
5f073516-4251-45d0-b603-6f035fef1dcd	8ba2803a-79bc-44d8-a196-3b9c908ee53a	images/products/8ba2803a-79bc-44d8-a196-3b9c908ee53a/1777036245919-820676-1786717709543-229052.png	\N	5
6ff002d1-ddb6-416c-aaf9-6a8e00a5da3d	737156d2-71fc-409e-ac15-8467beeafb7d	images/products/737156d2-71fc-409e-ac15-8467beeafb7d/1777291501473-503021-1786717709668-679197.png	\N	2
7d6b48bc-b850-457c-ab1c-a21f808c2263	737156d2-71fc-409e-ac15-8467beeafb7d	images/products/737156d2-71fc-409e-ac15-8467beeafb7d/1777291501485-23883-1786717709784-584554.png	\N	5
7cd4c018-af1e-4ce1-afcf-41db80c798a2	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080494-961540-1786717709865-803757.png	\N	0
1681f60c-a9e1-407d-8c3f-e6d3e969cd35	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080505-696166-1786717709999-170346.png	\N	3
7d808d6f-8da6-482b-89c2-12103af2e247	b9a62212-8ee0-4fe4-9aa7-a5b38879474a	images/products/b9a62212-8ee0-4fe4-9aa7-a5b38879474a/1777294080512-552596-1786717710127-211420.png	\N	5
33d53c01-038f-4a5d-ae4b-ef065b6167a9	13c4f972-e7f5-47e4-a95e-958d831f5c09	images/products/13c4f972-e7f5-47e4-a95e-958d831f5c09/1777297006922-522214-1786717710256-402761.png	\N	2
970c7ddb-9899-4d0a-b6cb-5897d235424c	13c4f972-e7f5-47e4-a95e-958d831f5c09	images/products/13c4f972-e7f5-47e4-a95e-958d831f5c09/1777297006927-313641-1786717710366-423733.png	\N	4
eeb0e00a-7bd6-4871-9798-32c221762a90	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296118-844156-1786717710441-213542.png	\N	6
46eb4bd5-1cde-422e-8dc2-c996caf5cbef	89c9d036-8a2d-45a4-97d2-05ea9051a67c	images/products/89c9d036-8a2d-45a4-97d2-05ea9051a67c/1777303296110-110799-1786717710564-645879.png	\N	1
920a975c-8532-4b26-b5ca-af82a1fd442f	ff911850-c0bb-46ab-96e1-0d40fc368bbd	images/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd/1777309134687-659697-1786717710709-897107.png	\N	0
7abe34b5-f241-4c5a-847d-ff06aa919266	ff911850-c0bb-46ab-96e1-0d40fc368bbd	images/products/ff911850-c0bb-46ab-96e1-0d40fc368bbd/1777309134695-329618-1786717710832-870652.png	\N	3
3ff7703c-b1c9-4ed6-bfcf-62a563852c8b	5bc3c681-3786-441f-9b28-f60429b93ca1	images/products/5bc3c681-3786-441f-9b28-f60429b93ca1/1777310197821-908592-1786717710997-327380.png	\N	1
bb1b8743-4469-4781-9114-ce7889f02ba4	5bc3c681-3786-441f-9b28-f60429b93ca1	images/products/5bc3c681-3786-441f-9b28-f60429b93ca1/1777310197824-804662-1786717711078-683559.png	\N	3
42397718-dc0d-4521-9760-972f72be44de	b3189385-9ff5-47db-b2f7-a0e2f62599ef	images/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef/1778242469192-157959-1786717711188-437546.png	\N	0
ac6a5545-1436-4889-adae-5740bfbf3d86	b3189385-9ff5-47db-b2f7-a0e2f62599ef	images/products/b3189385-9ff5-47db-b2f7-a0e2f62599ef/1778242469195-901100-1786717711311-574893.png	\N	1
8c2aff07-d330-460f-b43f-cefd5defd43b	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971136-38040-1786717711429-234265.png	\N	3
3b161618-ed60-4a1d-af72-4049ff7b7f67	96f47051-f9da-4581-a78e-0202647f9117	images/products/96f47051-f9da-4581-a78e-0202647f9117/1778243971134-349649-1786717711539-900906.png	\N	1
96bd9a85-44fa-4eb6-bbf8-b40af67e15a5	4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	images/products/4a37919d-9ba2-442b-8bd1-5b0b26b7eba6/1779777772167-361912-1786717711647-147467.png	\N	0
329924cc-f98b-4033-95a2-3cf9ca426543	a44ba47b-5947-4c24-bd37-16a336bd4057	images/products/a44ba47b-5947-4c24-bd37-16a336bd4057/1781605432007-847615-1786717711783-588001.png	\N	1
df625063-4a6e-4c5d-8cec-9c8677b2ff30	a44ba47b-5947-4c24-bd37-16a336bd4057	images/products/a44ba47b-5947-4c24-bd37-16a336bd4057/1781605432012-692435-1786717711830-219331.png	\N	2
2ddf7a2a-4a80-415e-92ae-61718cfa9974	a44ba47b-5947-4c24-bd37-16a336bd4057	images/products/a44ba47b-5947-4c24-bd37-16a336bd4057/1781605432028-674263-1786717711964-974915.png	\N	5
46e4d698-a9bd-458a-9fdd-64352a9c06a7	d855cbb9-366c-4c40-b6f6-198dccb08934	images/products/d855cbb9-366c-4c40-b6f6-198dccb08934/1781607564741-576946-1786717712140-575759.png	\N	1
6fd4042a-99a7-4cf8-81ba-af20cd75422d	f05883de-2d1f-41b5-b06f-f4154461aede	images/products/f05883de-2d1f-41b5-b06f-f4154461aede/1785305442983-672998-1786717712274-805502.jpg	\N	3
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.products (id, name, description, gsm, video_url, is_active, category_id, fabric_id, style_id, created_at, updated_at, available_sizes) FROM stdin;
d8d66d2c-80c2-4359-9195-046a6bd0436d	Sports tee	High-performance moisture-wicking dry-fit ,dot net tee for sports teams, marathons and fitness events. Lightweight and breathable.Premium quality 180 GSM dry-fit cricket jersey designed for performance and comfort. Made with breathable, sweat-wicking fabric to keep players cool during long matches. Lightweight and stretchable material ensures easy movement while batting, bowling, and fielding. Perfect for team uniforms, tournaments, and custom printing.	180	\N	t	bb08cb41-b914-4236-bffe-4e136600cb93	acb38714-a092-4bd5-98fe-453eb022133e	73bec873-30f1-40c0-8c80-89e36956fc43	2026-04-11 04:55:24.342	2026-04-19 13:16:24.069	{}
7c2c6b9a-c387-4de3-81be-508d540904a3	Corporate Classic Round Neck	A timeless round-neck T-shirt crafted from 100% pure cotton. Perfect for corporate branding, company gifting and uniform programmes. Pre-shrunk and colourfast.	180	\N	f	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-11 04:55:24.335	2026-04-16 10:52:01.273	{}
332a089c-172c-4108-b3f7-46b4d6d463ca	Round Neck True Biowash	Upgrade your everyday style with our premium Biowash Round Neck T-Shirt, designed for superior comfort and long-lasting quality. Made from high-quality cotton fabric, this t-shirt undergoes a special biowash process that enhances softness, smoothness, and durability.\n\nThe classic round neck and regular fit make it perfect for daily wear, casual outings, and layering. Its breathable fabric ensures all-day comfort, while the color-fast technology keeps the t-shirt looking new even after multiple washes.	180	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-11 07:30:37.976	2026-08-03 10:58:01.589	{S,M,L,XL,XXL}
d0163b49-520e-46c2-bdf2-a845eb71ec17	Premium Cotton Terry 220 GSM	Premium Cotton Terry 220 GSM fabric is a high-quality, thick, and durable material designed for superior comfort and long-lasting performance. Known for its soft texture and excellent absorbency, this fabric features a smooth outer surface with a looped inner structure, making it ideal for both casual and premium apparel.\n\nWith a weight of 220 GSM, it offers a perfect balance between heaviness and breathability, making it suitable for all-season wear—especially preferred for winter collections and premium streetwear.( men & women )	220	\N	t	9fd54e76-cd1d-42a5-8f18-da7436e5f157	1032ff4f-0806-43ba-ab4c-90431e87bc7c	e9cda666-eb91-4328-a9df-a88eac917fc0	2026-04-11 12:16:35.104	2026-04-16 06:28:03.606	{}
13c4f972-e7f5-47e4-a95e-958d831f5c09	Round Neck 115	Polyester Round Neck T-Shirt – 120 GSM\n\nLightweight, durable, and performance-ready — this 120 GSM polyester round neck T-shirt is designed for comfort and versatility. Ideal for sports, events, promotions, and bulk printing needs.	120	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	acb38714-a092-4bd5-98fe-453eb022133e	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-27 12:53:39.049	2026-04-27 13:36:45.339	{S,M,L,XL,XXL,3XL}
b9a62212-8ee0-4fe4-9aa7-a5b38879474a	Round Neck 114	Crafted from  dry-fit polyester fabric, this t-shirt is designed to handle intense workouts and sports activities. The 180 GSM fabric provides a slightly heavier, more durable feel while maintaining excellent breathability and comfort.	180	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	acb38714-a092-4bd5-98fe-453eb022133e	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-24 13:18:41.349	2026-04-27 12:47:57.89	{S,M,L,XL,XXL}
bd17ea99-b858-4b1a-bf9d-3aa9934c25ba	Kids Round Neck	🧸 Kids’ Premium Cotton Round Neck T-Shirt – 180 GSM\n\nGive your kids the perfect mix of comfort, softness, and durability with our premium round neck t-shirt. Made from 100% pure cotton (180 GSM), this t-shirt is gentle on the skin and ideal for all-day wear — whether it’s playtime, school, or outings.	180	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	ce12a47a-b20d-422d-b2a2-cbf174a7c573	73bec873-30f1-40c0-8c80-89e36956fc43	2026-04-13 13:09:19.886	2026-05-13 04:06:26.202	{M,L,XS,S}
8ba2803a-79bc-44d8-a196-3b9c908ee53a	Round Neck 112	Made from premium polyester sinker fabric, this t-shirt features a single jersey knit structure that provides a smooth surface, soft feel, and excellent breathability. With its 115–125 GSM lightweight construction, it ensures maximum comfort, especially in warm weather conditions.	115	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	6b503c95-583b-4019-a6d3-80444f67607a	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-24 11:45:02.222	2026-04-27 11:37:29.764	{M,L,XL,XXL}
737156d2-71fc-409e-ac15-8467beeafb7d	Round Neck 113	Made from high-quality micro polyester fabric, this t-shirt is lightweight, breathable, and designed to keep you cool during intense physical activity. The 160 GSM fabric offers the ideal balance between durability and comfort, making it suitable for regular sports use.	160	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	6b503c95-583b-4019-a6d3-80444f67607a	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-24 13:15:58.372	2026-08-06 07:20:44.567	{M,L,XL,XXL}
a6fa9e13-d502-42a4-b37d-0a0b713b5c03	Polo Spun Matty 200 GSM	Upgrade your everyday and uniform wear with our premium Polo Spun Matty T-Shirts, crafted from a perfect blend of 70% Cotton and 30% Polyester. Designed for comfort, durability, and a smart appearance, this fabric ensures long-lasting performance with a smooth finish.	200	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	e499350a-5f65-4bde-bf4d-a9753328280d	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-17 12:51:41.482	2026-07-29 06:41:20.965	{M,L,XL,XXL}
f7937fc0-24c3-4087-874a-472e78047ecd	Premium Matti 240 GSM	🔥 Premium Matti 240 GSM Polo T-Shirt\n\nExperience the perfect blend of comfort and durability with our Polo  Matty 240 GSM T-Shirts. Crafted with a premium 70% Cotton and 30% Polyester mix, these polos offer a soft feel with enhanced strength and long-lasting performance.	240	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	e499350a-5f65-4bde-bf4d-a9753328280d	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-16 11:06:11.003	2026-05-08 07:35:57.647	{XS,S,M,L,XL,XXL,3XL,4XL}
7f54851a-dbdc-43a3-9bb5-d7b2b1225048	Polo Unisex Premium Sports & Casual Wear	180 GSM Polyester Polo T-Shirts, designed for a perfect blend of style, comfort, and performance. these T-shirts are lightweight, durable, and ideal for everyday use.\n\nThe quick-dry technology helps absorb sweat and dries faster, making it a great choice for sports, gym sessions, office wear, and casual outings. The breathable fabric keeps you cool and comfortable throughout the day.\n\nFeaturing a classic polo collar with a button placket, this T-shirt offers a smart and versatile look suitable for both casual and semi-formal occasions.\n\nIts unisex design ensures a comfortable fit for both men and women. Whether you’re looking for daily wear or bulk use for branding and printing, this polo T-shirt is a reliable and stylish option.	180	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	6b503c95-583b-4019-a6d3-80444f67607a	73bec873-30f1-40c0-8c80-89e36956fc43	2026-04-11 11:14:44.524	2026-04-19 12:37:57.846	{}
3a088ad2-1312-45b0-8a3d-bbb252599f9f	Kids polyester t shirts	👕 Kids Polyester T-Shirts – \n\nKeep kids comfortable and stylish with our premium polyester T-shirts, designed for everyday wear and vibrant printing. Made from high-quality fabric, these T-shirts are lightweight, durable, and perfect for active kids.	180	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	6b503c95-583b-4019-a6d3-80444f67607a	73bec873-30f1-40c0-8c80-89e36956fc43	2026-04-17 13:57:38.814	2026-04-19 08:50:10.125	{}
0b38413f-5524-4478-bdf6-83f25eff1427	Premium Micro Polo	Upgrade your everyday style with our Premium Micro Polo T-Shirt, designed for superior comfort, durability, and a sleek modern look. Crafted using high-performance micro fabric, this polo delivers a perfect balance of breathability, softness, and long-lasting wear.\n\nMade from advanced micro polyester or blended fibers, the fabric ensures quick-dry performance and excellent moisture absorption, keeping you cool and fresh throughout the day. Ideal for corporate wear, sports, promotions, and casual styling.	200	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	6b503c95-583b-4019-a6d3-80444f67607a	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-22 08:52:22.136	2026-04-22 08:59:55.361	{}
348e50a4-14e3-4179-a873-38e305687fdd	Premium PC Mattee	Experience the perfect blend of comfort and durability with our Premium PC Mattee Polo T-Shirt. Crafted from a high-quality Polyester-Cotton (PC) blend, this polo features a signature mattee (piqué) texture that offers a rich look with enhanced breathability.\n\nDesigned for all-day wear, this fabric combines the softness of cotton with the strength and wrinkle resistance of polyester, making it ideal for uniforms, corporate wear, and everyday use.	240	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	e499350a-5f65-4bde-bf4d-a9753328280d	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-22 09:33:05.985	2026-04-22 09:33:05.985	{}
9ac310be-2d6d-471e-a919-f603da96c569	Polo Sports	Reddy design with team logo & your Name/ number Stay active and comfortable with our Polyester Sports Polo T-Shirt, specially designed for performance and everyday use. Made from lightweight 160 GSM dry-fit polyester fabric, this polo ensures maximum breathability, quick drying, and sweat control, making it perfect for sports and outdoor activities.	160	\N	t	bb08cb41-b914-4236-bffe-4e136600cb93	acb38714-a092-4bd5-98fe-453eb022133e	73bec873-30f1-40c0-8c80-89e36956fc43	2026-04-22 12:26:52.614	2026-04-22 13:02:50.57	{}
89c9d036-8a2d-45a4-97d2-05ea9051a67c	Round Neck 116	Micro Polyester Dry-Fit Round Neck T-Shirt – 140 GSM\n\nStay cool, dry, and comfortable with this premium micro polyester dry-fit T-shirt. Designed for active wear and daily use, it offers excellent breathability and a sleek, sporty look.	140	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	6b503c95-583b-4019-a6d3-80444f67607a	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-27 12:57:08.944	2026-04-27 15:21:34.927	{S,M,L,XL,XXL}
f5033457-10b1-4ac9-aca0-a99dcc5e4fb8	PC MATTI 220 GSM	Our PC Matti 220 GSM Fabric is specially designed to meet the demanding needs of school uniforms and institutional wear. Made from a high-quality polyester-cotton blend, this fabric combines the strength of polyester with the comfort of cotton, ensuring long-lasting performance and all-day comfort for students.	220	\N	t	08652fc9-65c6-4743-9ae6-fc9111a5a828	e499350a-5f65-4bde-bf4d-a9753328280d	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-16 11:39:22.875	2026-05-06 01:57:04.615	{18,20,22,24,26,28,30,32,34}
d18abd68-8383-44c8-93eb-a15fbe77ab15	Biowash Round Neck	180 bio wash reguler fit is crafted from high-quality 100% Cotton fabric (180GSM), designed for bulk B2B orders. Perfect for corporates, events, and institutions. Factory-direct pricing ensures maximum value with no compromise on quality. Available in all sizes, mix of sizes allowed.	180	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-16 11:27:25.242	2026-08-03 10:56:29.791	{S,M,L,XL,XXL}
f05883de-2d1f-41b5-b06f-f4154461aede	GIFT SET	Upgrade your corporate gifting with this elegant Executive Gift Set, featuring a premium leather-finish notebook and a sleek metal pen in a luxury presentation box. Designed for professionals, this gift set is perfect for creating a lasting impression while offering everyday functionality.	250	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	73bec873-30f1-40c0-8c80-89e36956fc43	2026-07-29 06:10:42.652	2026-07-29 06:11:24.822	{S,M,L,XL,XXL}
bdb776f3-6cb6-4da5-b60d-47339af1ceb6	Premium Polo 240 GSM	🔥 Premium Polo T-Shirt – 240 GSM\n\n 80 % cotton 20% Polyester Experience the perfect combination of style, durability, and comfort with our Premium 240 GSM Polo T-Shirt. Crafted from high-quality fabric, this polo offers a rich feel, structured look, and long-lasting performance — making it ideal for both casual wear and corporate use.	240	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	e499350a-5f65-4bde-bf4d-a9753328280d	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-22 07:35:26.014	2026-05-04 12:05:31.582	{S,M,L,XL,XXL}
ff911850-c0bb-46ab-96e1-0d40fc368bbd	Premium Tipping Polo	Premium Tipping Polo T-Shirt – 240 GSM\n\nUpgrade your style with this premium tipping polo T-shirt, crafted for a sharp, professional look and superior comfort. Perfect for corporate wear, branding, and everyday elegance.	240	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-27 16:39:39.382	2026-05-05 12:15:35.262	{S,M,L,XL,XXL,3XL}
c8878bc6-c448-44c0-b075-a98745a44eaa	Round Neck 111	Our Round Neck sports t-shirts are made from micro polyester fabric, the perfect choice for sports person, marathon runners, athletes, and fitness enthusiasts. Our micro polyester fabric is specifically designed to wick away moisture, keeping you cool and comfortable during even the most intense activity. With a lightweight and breathable feel, our sports t-shirts allow for maximum range of motion, ensuring that you can perform at your best. The durable and quick-drying fabric also makes these shirts perfect for outdoor activities such as hiking, running, and cycling. Available in a range of colors and sizes, our sports t-shirts made from micro polyester fabric are the perfect suited for sports, marathons, Gym.	110	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	6b503c95-583b-4019-a6d3-80444f67607a	ed938554-75e4-413c-8629-ea44ab7642b5	2026-04-24 11:34:26.9	2026-05-08 09:47:34.235	{S,M,L,XL,XXL}
d7ee7563-6263-433f-bced-e37fdf1797b8	Cotton Terry 210 GSM	High-quality Cotton Terry 200 GSM fabric offers the perfect blend of comfort, durability, and lightweight warmth. Crafted from premium cotton yarn, this fabric features a soft outer finish with a looped inner texture, providing excellent breathability and moisture absorption.\n\nWith a 200 GSM weight, it is slightly lighter than heavy terry fabrics, making it ideal for all-season wear—especially for comfortable casual and athleisure clothing.	210	\N	t	9fd54e76-cd1d-42a5-8f18-da7436e5f157	1032ff4f-0806-43ba-ab4c-90431e87bc7c	e9cda666-eb91-4328-a9df-a88eac917fc0	2026-04-11 13:15:35.851	2026-08-03 10:57:29.269	{S,M,L,XL,XXL}
4a37919d-9ba2-442b-8bd1-5b0b26b7eba6	MAHAKAL COTTON KURTA	MAHAKAL COTTON KURTA\n\nBring devotion and style together with the exclusive Prime Linor Mahakal Cotton Kurta Collection. Designed for comfort and spiritual fashion lovers, this premium kurta features stylish Mahakal-inspired prints with a modern ethnic look perfect for daily wear, festivals, outings, and special occasions.\n\nCrafted from soft and breathable cotton fabric, this kurta offers all-day comfort with a trendy relaxed fit. The unique Mahakal typography and Om-inspired patterns create a bold spiritual streetwear vibe loved by youth and Mahadev devotees.	120	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	ce12a47a-b20d-422d-b2a2-cbf174a7c573	73bec873-30f1-40c0-8c80-89e36956fc43	2026-05-26 06:36:58.645	2026-05-26 06:42:51.494	{M,L,XL}
5bc3c681-3786-441f-9b28-f60429b93ca1	Eco Polo Tipping	Eco Polo Tipping T-Shirt – 220 GSM\n\nA perfect blend of sustainability, comfort, and style — this Eco Polo T-shirt with contrast tipping is designed for modern brands that value both quality and responsibility. Ideal for corporate wear, uniforms, and premium promotions.	220	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-04-27 17:08:23.362	2026-08-03 10:54:53.852	{S,M,L,XL,XXL,3XL}
a44ba47b-5947-4c24-bd37-16a336bd4057	Honeycomb Matty	Honeycomb Matty Fabric\n\nPremium Honeycomb Matty fabric is designed for comfort, durability, and a professional look. Its unique honeycomb texture provides excellent breathability, making it ideal for polo T-shirts, corporate wear, uniforms, promotional apparel, and casual clothing.	180	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	e499350a-5f65-4bde-bf4d-a9753328280d	421b694d-09a0-43f4-802b-cdc6d6e52efb	2026-06-16 10:23:49.685	2026-06-16 10:24:19.525	{S,M,L,XL,XXL}
d855cbb9-366c-4c40-b6f6-198dccb08934	Oversized Tee Bio-Wash.	Oversized T-Shirts – Premium Comfort Meets Modern Style\n\n BLACK / WHITE Upgrade your wardrobe with Prime Linor Oversized T-Shirts, designed for all-day comfort and a trendy streetwear look. Crafted from premium-quality fabric, these drop-shoulder tees offer a relaxed fit that feels as good as it looks.	180	\N	t	9fd54e76-cd1d-42a5-8f18-da7436e5f157	a132405d-7a9e-4418-ad38-18b5cf82aeba	e9cda666-eb91-4328-a9df-a88eac917fc0	2026-06-16 10:59:23.006	2026-08-03 10:53:43.967	{S,M,L,XL,XXL}
96f47051-f9da-4581-a78e-0202647f9117	Round Neck Cotton	100% Cotton 180 GSM Round Neck T-Shirt\n\nUpgrade your everyday style with our Premium 100% Cotton 180 GSM T-Shirt, designed for comfort, durability, and a perfect regular fit. Made from high-quality bio-washed cotton fabric, this t-shirt feels soft on the skin and is ideal for daily wear, casual outings, corporate use, promotions, and custom printing.	160	\N	t	7503fab7-02bd-451d-a24d-7fde13ef86b2	ce12a47a-b20d-422d-b2a2-cbf174a7c573	ed938554-75e4-413c-8629-ea44ab7642b5	2026-05-08 12:18:35.458	2026-08-03 10:54:24.722	{S,M,L,XL,XXL}
b3189385-9ff5-47db-b2f7-a0e2f62599ef	Round Neck 117	Experience comfort and performance with the Manchester Dry Fit T-Shirt, designed for sports, gym, events, promotions, and daily active wear. Made from premium Micro Polyester fabric with Interlock Single Jersey knit, this t-shirt offers a smooth feel, lightweight comfort, and excellent sweat-wicking performance.	200	\N	t	6fd9b1f3-fd31-475b-8924-3144cdd34c86	6b503c95-583b-4019-a6d3-80444f67607a	ed938554-75e4-413c-8629-ea44ab7642b5	2026-05-08 11:19:41.827	2026-08-03 10:54:39.876	{S,M,L,XL,XXL}
a1d9ba42-6745-4613-a8a1-c763ef9bbc71	College Batch Oversized Tee Bio-Wash.	Upgrade your collection with our premium oversized T-shirts, crafted to deliver the perfect blend of style, comfort, and durability. Designed keeping modern streetwear trends in mind, these T-shirts are ideal for resellers looking to offer high-demand, high-quality products.\n\nMade from 100% premium cotton fabric, this T-shirt ensures superior breathability and all-day comfort. The 220 GSM heavyweight fabric provides a rich, structured feel, making it perfect for both casual wear and fashion-forward styling.\n\nOur advanced bio-wash process enhances softness while maintaining fabric strength, giving the T-shirt a smooth finish and long-lasting performance. With color fastness guaranteed, the fabric retains its vibrant look even after multiple washes.\n\nThe pre-shrunk material ensures consistent sizing, reducing returns and increasing customer satisfaction — a key advantage for resellers. Its oversized fit delivers a relaxed, trendy silhouette that is highly popular among today’s fashion-conscious buyers.	220	\N	t	9fd54e76-cd1d-42a5-8f18-da7436e5f157	ce12a47a-b20d-422d-b2a2-cbf174a7c573	e9cda666-eb91-4328-a9df-a88eac917fc0	2026-04-11 04:55:24.348	2026-08-06 12:04:51.948	{S,M,L,XL,XXL}
\.


--
-- Data for Name: styles; Type: TABLE DATA; Schema: public; Owner: growbill
--

COPY public.styles (id, name, description, is_active) FROM stdin;
421b694d-09a0-43f4-802b-cdc6d6e52efb	Polo	Collared polo with 2-button placket — ideal for corporate uniforms and hospitality staff.	t
ed938554-75e4-413c-8629-ea44ab7642b5	Round Neck	Classic crew-neck cut — the most popular style for bulk orders, events and everyday wear.	t
dd9e4185-8197-46f3-9e82-b70d9b67708d	V-Neck	V-shaped neckline for a smart, modern look — preferred for corporate and semi-formal settings.	t
e9cda666-eb91-4328-a9df-a88eac917fc0	Oversized	Dropped shoulders and relaxed boxy fit — trending with colleges, streetwear brands and youth events.	t
48601b48-65f3-4b9b-9b6f-fca5d1b71bba	Full Sleeve	Full-length sleeves — great for winter events, corporate trips and premium merchandise.	t
73bec873-30f1-40c0-8c80-89e36956fc43	Half Sleeve	Standard short sleeve — versatile and comfortable for all seasons and occasions.	t
a3e85d8f-a68c-4f92-8ec9-7f8c77f875d6	Sleeveless	No sleeves for maximum mobility — popular for gyms, sports teams and summer events.	t
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: enquiries enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);


--
-- Name: fabric_types fabric_types_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.fabric_types
    ADD CONSTRAINT fabric_types_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pricing_slabs pricing_slabs_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.pricing_slabs
    ADD CONSTRAINT pricing_slabs_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: styles styles_pkey; Type: CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.styles
    ADD CONSTRAINT styles_pkey PRIMARY KEY (id);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: growbill
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: analytics_events_created_at_idx; Type: INDEX; Schema: public; Owner: growbill
--

CREATE INDEX analytics_events_created_at_idx ON public.analytics_events USING btree (created_at);


--
-- Name: analytics_events_event_idx; Type: INDEX; Schema: public; Owner: growbill
--

CREATE INDEX analytics_events_event_idx ON public.analytics_events USING btree (event);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: growbill
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: fabric_types_name_key; Type: INDEX; Schema: public; Owner: growbill
--

CREATE UNIQUE INDEX fabric_types_name_key ON public.fabric_types USING btree (name);


--
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: growbill
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- Name: styles_name_key; Type: INDEX; Schema: public; Owner: growbill
--

CREATE UNIQUE INDEX styles_name_key ON public.styles USING btree (name);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pricing_slabs pricing_slabs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.pricing_slabs
    ADD CONSTRAINT pricing_slabs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_fabric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_fabric_id_fkey FOREIGN KEY (fabric_id) REFERENCES public.fabric_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: growbill
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.styles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 48fsBphEj3l5Zxhs6RitNv15BkiEWcI57Kz6mqoq6nV5c25IVdCSjrtCVgCfltm

