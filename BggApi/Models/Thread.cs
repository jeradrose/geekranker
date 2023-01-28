using System.Xml.Serialization;

namespace BggApi.Models;

[XmlType("item")]
public class Thread {
    [XmlAttribute("id")]
    public int Id { get; set; }

    [XmlAttribute("numarticles")]
    public int NumArticles { get; set; }

    [XmlElement("subject")]
    public string Subject { get; set; }
    [XmlElement("articles")]
    public Articles Articles { get; set; }
}

public class Articles {
    [XmlElement("article")]
    public List<Article> ArticleList { get; set; }
}

public class Article {
    [XmlElement("subject")]
    public string Subject { get; set; }

    [XmlElement("body")]
    public string Body { get; set; }
}
