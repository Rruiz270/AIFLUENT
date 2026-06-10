"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  TrendingUp,
  Briefcase,
  DollarSign,
  Send,
  MessageCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  index: number;
  iconColor: string;
  iconBg: string;
  href?: string;
}

function useCountUp(end: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return count;
}

function StatCard({
  icon: Icon,
  title,
  value,
  index,
  iconColor,
  iconBg,
  href,
}: StatCardProps) {
  const router = useRouter();
  // Parse the numeric part for count-up
  const numericMatch = value.match(/[\d.,]+/);
  const numericValue = numericMatch
    ? parseFloat(numericMatch[0].replace(/\./g, "").replace(",", "."))
    : 0;
  const animatedNum = useCountUp(numericValue);

  // Rebuild the display string with animated number
  const formatAnimatedValue = () => {
    if (value.startsWith("R$")) {
      return `R$ ${animatedNum.toLocaleString("pt-BR")}`;
    }
    if (value.endsWith("%")) {
      return `${(animatedNum / 10).toFixed(1)}%`;
    }
    if (value.endsWith("min")) {
      return `${animatedNum}min`;
    }
    return animatedNum.toLocaleString("pt-BR");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onClick={() => href && router.push(href)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-300 hover:border-gray-200 hover:bg-gray-100",
        href && "cursor-pointer",
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {formatAnimatedValue()}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

interface StatsGridProps {
  stats: DashboardStats;
}

const statConfig = [
  {
    key: "totalLeads" as const,
    icon: Users,
    title: "Total Leads",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    format: (v: number) => v.toLocaleString("pt-BR"),
    href: "/leads",
  },
  {
    key: "newLeadsToday" as const,
    icon: UserPlus,
    title: "Novos Hoje",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    format: (v: number) => v.toLocaleString("pt-BR"),
    href: "/leads",
  },
  {
    key: "conversionRate" as const,
    icon: TrendingUp,
    title: "Taxa de Conversão",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    format: (v: number) => `${v}%`,
    href: "/reports",
  },
  {
    key: "activeDeals" as const,
    icon: Briefcase,
    title: "Negócios Ativos",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    format: (v: number) => v.toLocaleString("pt-BR"),
    href: "/deals",
  },
  {
    key: "totalRevenue" as const,
    icon: DollarSign,
    title: "Receita Total",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    format: (v: number) => `R$ ${v.toLocaleString("pt-BR")}`,
    href: "/reports",
  },
  {
    key: "campaignsSent" as const,
    icon: Send,
    title: "Campanhas Enviadas",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    format: (v: number) => v.toLocaleString("pt-BR"),
    href: "/campaigns",
  },
  {
    key: "responseRate" as const,
    icon: MessageCircle,
    title: "Taxa de Resposta",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    format: (v: number) => `${v}%`,
    href: "/campaigns",
  },
  {
    key: "avgResponseTime" as const,
    icon: Clock,
    title: "Tempo Médio Resposta",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
    format: (v: number) => `${v}min`,
    href: "/reports",
  },
];

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
      {statConfig.map((config, index) => (
        <StatCard
          key={config.key}
          icon={config.icon}
          title={config.title}
          value={config.format(stats[config.key])}
          index={index}
          iconColor={config.iconColor}
          iconBg={config.iconBg}
          href={config.href}
        />
      ))}
    </div>
  );
}
