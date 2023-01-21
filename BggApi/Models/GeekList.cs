using System.Xml.Serialization;

namespace BggApi.Models;

[XmlType("geeklist")]
public class GeekList {
    [XmlAttribute("id")]
    public int Id { get; set; }

    [XmlElement("item")]
    public List<Item> Items { get; set; }
}

public class Item {
    [XmlAttribute("id")]
    public int Id { get; set; }

    [XmlAttribute("objecttype")]
    public string ObjectType { get; set; }

    [XmlAttribute("subtype")]
    public string SubType { get; set; }

    [XmlAttribute("objectid")]
    public int ObjectId { get; set; }
}
