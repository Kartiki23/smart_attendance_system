import { useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { User, Link2 } from "lucide-react"

import { CollegeHeader } from "@/components/CollegeHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LinkStudent() {

  const [rollNumber, setRollNumber] = useState<string>("")
  const [relation, setRelation] = useState<string>("Guardian")
  const [contactNumber, setContactNumber] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const token = localStorage.getItem("token")

  const handleLinkStudent = async () => {

    if (!rollNumber) {
      alert("Please enter student roll number")
      return
    }

    try {

      setLoading(true)

      await axios.post(
        "/api/parents/link-student",
        {
          rollNumber,
          relation,
          contactNumber
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Student linked successfully!")

      window.location.href = "/parent-dashboard"

    } catch (error: any) {

      alert(error.response?.data?.message || "Linking failed")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <CollegeHeader />

      <div className="container mx-auto px-4 py-12 flex justify-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >

          <Card className="card-professional">

            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <User className="w-5 h-5" />
                Link Your Child
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div>
                <label className="text-sm font-medium">
                  Student Roll Number
                </label>

                <Input
                  placeholder="Enter roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>


              <div>
                <label className="text-sm font-medium">
                  Relation
                </label>

                <select
                  className="w-full border rounded-md p-2"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>


              <div>
                <label className="text-sm font-medium">
                  Contact Number
                </label>

                <Input
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>


              <Button
                onClick={handleLinkStudent}
                className="w-full bg-primary hover:bg-primary/90 flex gap-2"
                disabled={loading}
              >
                <Link2 className="w-4 h-4" />
                {loading ? "Linking..." : "Link Student"}
              </Button>

            </CardContent>

          </Card>

        </motion.div>

      </div>

    </div>
  )
}