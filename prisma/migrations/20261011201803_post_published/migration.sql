-- AddColumn
-- NOTE: added with DEFAULT true first so existing rows are backfilled as
-- published. A single `ADD COLUMN ... DEFAULT false` would silently unpublish
-- every post that already exists. The default is dropped to false immediately
-- after, so newly created posts start as drafts.
ALTER TABLE "Post" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterColumn
ALTER TABLE "Post" ALTER COLUMN "published" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_published_idx" ON "Post"("published");