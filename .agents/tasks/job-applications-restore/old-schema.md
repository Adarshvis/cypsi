# Old schema (from backups\cps_pre_drop_20260816_110840.dump, schema only; rows NOT restored)

## Enums
```sql
CREATE TYPE public.enum_job_applications_request_type AS ENUM (
    'software',
    'it-service'
);
CREATE TYPE public.enum_job_applications_status AS ENUM (
    'new',
    'reviewed',
    'shortlisted',
    'rejected',
    'deleted'
);
CREATE TYPE public.enum_job_applications_work_status AS ENUM (
    'student',
    'phd_scholar',
    'faculty',
    'admin_staff',
    'other'
);
```

## job_applications
```sql
--
-- PostgreSQL database dump
--

\restrict vL6DBidYbcMLRKEPAa3jgMhP9kFlREO0jazdeiTk8uJa04Gpckw75EQ6FTApdr5

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id integer NOT NULL,
    applicant_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    job_title character varying NOT NULL,
    current_address character varying,
    permanent_address character varying,
    highest_qualification character varying,
    work_status public.enum_job_applications_work_status,
    year_of_experience character varying,
    resume_id integer,
    status public.enum_job_applications_status DEFAULT 'new'::public.enum_job_applications_status NOT NULL,
    submitted_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    request_type public.enum_job_applications_request_type DEFAULT 'software'::public.enum_job_applications_request_type NOT NULL
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- PostgreSQL database dump complete
--

\unrestrict vL6DBidYbcMLRKEPAa3jgMhP9kFlREO0jazdeiTk8uJa04Gpckw75EQ6FTApdr5


```

## resumes
```sql
--
-- PostgreSQL database dump
--

\restrict nlzMizncTcHD9zhPsMhTodovACSHVFRzGGnASKhpgJyWoEMgDpPGQhEkfMR24DI

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: resumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resumes (
    id integer NOT NULL,
    applicant_name character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric
);


ALTER TABLE public.resumes OWNER TO postgres;

--
-- PostgreSQL database dump complete
--

\unrestrict nlzMizncTcHD9zhPsMhTodovACSHVFRzGGnASKhpgJyWoEMgDpPGQhEkfMR24DI


```

## TOC entries
```n
1408; 1247 236290 TYPE public enum_job_applications_request_type postgres
1411; 1247 236296 TYPE public enum_job_applications_status postgres
1414; 1247 236308 TYPE public enum_job_applications_work_status postgres
253; 1259 241834 TABLE public job_applications postgres
254; 1259 241851 SEQUENCE public job_applications_id_seq postgres
13752; 0 0 SEQUENCE OWNED BY public job_applications_id_seq postgres
509; 1259 244771 TABLE public resumes postgres
510; 1259 244781 SEQUENCE public resumes_id_seq postgres
13766; 0 0 SEQUENCE OWNED BY public resumes_id_seq postgres
8701; 2604 247537 DEFAULT public job_applications id postgres
9389; 2604 247551 DEFAULT public resumes id postgres
13247; 0 241834 TABLE DATA public job_applications postgres
13503; 0 244771 TABLE DATA public resumes postgres
13779; 0 0 SEQUENCE SET public job_applications_id_seq postgres
13793; 0 0 SEQUENCE SET public resumes_id_seq postgres
10143; 2606 247620 CONSTRAINT public job_applications job_applications_pkey postgres
11317; 2606 248104 CONSTRAINT public resumes resumes_pkey postgres
10141; 1259 248632 INDEX public job_applications_created_at_idx postgres
10144; 1259 248633 INDEX public job_applications_resume_idx postgres
10145; 1259 248634 INDEX public job_applications_updated_at_idx postgres
10926; 1259 249090 INDEX public payload_locked_documents_rels_job_applications_id_idx postgres
10936; 1259 249098 INDEX public payload_locked_documents_rels_resumes_id_idx postgres
11314; 1259 249321 INDEX public resumes_created_at_idx postgres
11315; 1259 249322 INDEX public resumes_filename_idx postgres
11318; 1259 249323 INDEX public resumes_updated_at_idx postgres
12441; 2606 250108 FK CONSTRAINT public job_applications job_applications_resume_id_resumes_id_fk postgres
12653; 2606 251168 FK CONSTRAINT public payload_locked_documents_rels payload_locked_documents_rels_job_applications_fk postgres
12659; 2606 251198 FK CONSTRAINT public payload_locked_documents_rels payload_locked_documents_rels_resumes_fk postgres



```
