using NeoSmart.Caching.Sqlite;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSqliteCache(options => {
    options.CachePath = @"C:\Users\jader\Documents\git\geekranker\data\cache.db";
});

builder.Services.AddCors(options => {
    options.AddPolicy("GeekRankerWebPolicy",
        policy => {
            policy
                .WithOrigins("http://localhost:3000", "http://192.168.1.6:3000")
                //.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
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

app.UseHttpsRedirection();

app.UseCors("GeekRankerWebPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
