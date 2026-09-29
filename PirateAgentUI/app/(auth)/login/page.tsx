"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnchorIcon } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 700);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[380px]"
    >
      <Card className="border-border bg-card shadow-card p-0">
        <CardContent className="p-7">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface border border-border text-tan shadow-xs">
              <AnchorIcon className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">Log in to continue your research</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</Label>
              <Input id="email" type="email" placeholder="captain@pirateagent.ai" required className="bg-surface/50 border-border text-foreground" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</Label>
                <Link href="#" className="text-xs font-medium text-tan hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" defaultValue="password" required className="bg-surface/50 border-border text-foreground" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-semibold mt-2" loading={loading}>
              {!loading && (
                <>
                  Log in <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
              {loading && "Logging in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
