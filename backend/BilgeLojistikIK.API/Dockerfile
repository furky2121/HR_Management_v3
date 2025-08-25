# Multi-stage build for ASP.NET Core
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Create uploads directory
RUN mkdir -p /app/wwwroot/uploads/avatars && \
    chmod 755 /app/wwwroot/uploads/avatars

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["BilgeLojistikIK.API.csproj", "."]
RUN dotnet restore "BilgeLojistikIK.API.csproj"

# Copy source code
COPY . .
RUN dotnet build "BilgeLojistikIK.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BilgeLojistikIK.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Create non-root user for security
RUN addgroup --gid 1001 --system appgroup && \
    adduser --uid 1001 --system --ingroup appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

ENTRYPOINT ["dotnet", "BilgeLojistikIK.API.dll"]