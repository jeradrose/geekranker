using BggApi.Models.Attributes;
using System.Xml.Serialization;

namespace BggApi.Models;

[XmlType("item")]
public class CollectionItem {
    [XmlAttribute("objectid")]
    public int Id { get; set; }

    [XmlElement("name")]
    public string Name { get; set; }

    [XmlElement("yearpublished")]
    public int YearPublished { get; set; }

    [XmlElement("image")]
    public string Image { get; set; }

    [XmlElement("status")]
    public Status Status { get; set; }

    [XmlElement("numplays")]
    public int NumPlays { get; set; }

    [XmlElement("stats")]
    public Stats Stats { get; set; }
}

public class Status {
    [XmlAttribute("own")]
    public bool Own { get; set; }

    [XmlAttribute("prevowned")]
    public bool PreviouslyOwned { get; set; }

    [XmlAttribute("fortrade")]
    public bool ForTrade { get; set; }

    [XmlAttribute("want")]
    public bool Want { get; set; }

    [XmlAttribute("wanttoplay")]
    public bool WantToPlay { get; set; }

    [XmlAttribute("wanttobuy")]
    public bool WantToBuy { get; set; }

    [XmlAttribute("wishlist")]
    public bool Wishlist { get; set; }

    [XmlAttribute("preordered")]
    public bool Preordered { get; set; }
}

public class Stats {
    [XmlElement("rating")]
    public StringValueAttribute Rating { get; set; }
}