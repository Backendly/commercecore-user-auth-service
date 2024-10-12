-- CreateTable
CREATE TABLE "developer_profiles" (
    "developer_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "phone_number" VARCHAR,
    "address" VARCHAR,
    "profile_picture_url" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("developer_id")
);

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
