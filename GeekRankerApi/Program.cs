using Microsoft.AspNetCore.Rewrite;
using NeoSmart.Caching.Sqlite;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSqliteCache(options => {
    options.CachePath = @"C:\Users\jader\Documents\git\geekranker\data\cache.db";
});

builder.Services.AddCors(options => {
    options.AddPolicy(
        "SubdomainCorsPolicy",
        builder => builder
            .SetIsOriginAllowedToAllowWildcardSubdomains()
            .WithOrigins("https://*.geekranker.com", "https://geekranker.com")
            .AllowAnyMethod()
            .AllowCredentials()
            .AllowAnyHeader()
    );
});

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDeveloperExceptionPage();

app.UseRewriter(new RewriteOptions()
    .AddRedirectToNonWwwPermanent()
);

app.UseHttpsRedirection();

app.UseCors("SubdomainCorsPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
