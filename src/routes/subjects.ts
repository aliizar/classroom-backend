import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { Router } from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";
const router = Router();
// Get all subects with optional search , filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.body;
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);

    const offset = (currentPage - 1) * limitPerPage;

    const filteredConditions = [];

    //if search querry exists , filter by subjects name or subject code
    if (search) {
      filteredConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }
    // if department querry exists , filter by department name
    if (department) {
      filteredConditions.push(ilike(departments.name, `%${department}%`));
    }
    const whereClause =
      filteredConditions.length > 0 ? and(...filteredConditions) : undefined;
    const countResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);
    const totalCount = countResult[0]?.count ?? 0;
    const subjectList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.creadtedAt))
      .offset(offset)
      .limit(limitPerPage);

    res.json({
      data: subjectList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error(`Get /subjects arror : ${e}`);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});
export default router;
