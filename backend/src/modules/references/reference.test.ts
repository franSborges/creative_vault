import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../../app"


describe("Reference API", () => {
    it("should create a reference", async () => {
        const response = await request(app)
            .post("/api/references")
            .send({
                title: "Arquitetura gótica",
                type: "IMAGE",
                notes: "Referência para um desenho."
            })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("id")
            expect(response.body.title).toBe("Arquitetura gótica")
            expect(response.body.type).toBe("IMAGE")
        })

        it("should reject an invalid reference", async () => {
            const response = await request(app)
            .post("/api/references")
            .send({
                title: "",
                type: "INVALID"
            })

            expect(response.status).toBe(400)
        })

        it("should list references", async () => {
            const response = await request(app)
            .get("/api/references")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })
})
