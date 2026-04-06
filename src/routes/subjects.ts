import { and, count, desc, eq, getTableColumns, ilike, or } from "drizzle-orm";
import { Router } from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";
const router = Router();
// Get all subects with optional search , filtering and pagination
router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const department =
      typeof req.query.department === "string"
        ? req.query.department.trim()
        : undefined;
    const parsePositiveInt = (value: unknown, fallback: number) => {
      const parsed =
        typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
      return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
    };
    const currentPage = parsePositiveInt(req.query.page, 1);
    const limitPerPage = Math.min(parsePositiveInt(req.query.limit, 10), 100);

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
      .select({ count: count() })
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
      .orderBy(desc(subjects.createdAT))
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
