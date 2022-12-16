using BggApi.Models.Attributes;
using System.Xml.Serialization;

namespace BggApi.Models;

[XmlType("item")]
public class BoardGame {
    [XmlAttribute("id")]
    public int ObjectId { get; set; }

    [XmlElement("thumbnail")]
    public string? ThumbnailUrl { get; set; }

    [XmlElement("name")]
    public List<Name>? Names { get; set; }

    [XmlElement("link")]
    public List<Link>? Links { get; set; }

    [XmlElement("minplayers")]
    public IntValueAttribute MinPlayers { get; set; }

    [XmlElement("maxplayers")]
    public IntValueAttribute MaxPlayers { get; set; }

    [XmlElement("yearpublished")]
    public IntValueAttribute YearPublished { get; set; }

    [XmlElement("playingtime")]
    public IntValueAttribute PlayingTime { get; set; }

    [XmlElement("minplaytime")]
    public IntValueAttribute MinPlayTime { get; set; }

    [XmlElement("maxplaytime")]
    public IntValueAttribute MaxPlayTime { get; set; }

    [XmlElement("minage")]
    public IntValueAttribute MinAge { get; set; }

    [XmlElement("poll")]
    public List<Poll> Poll { get; set; }

    [XmlElement("statistics")]
    public List<Statistics> Statistics { get; set; }
}

public class Name : StringValueAttribute {
    [XmlAttribute("type")]
    public NameType Type { get; set; }
}

public class Link : IdAttribute {
    [XmlAttribute("type")]
    public LinkType Type { get; set; }
}

public class Poll {
    [XmlAttribute("name")]
    public PollName Name { get; set; }


    [XmlAttribute("title")]
    public string Title { get; set; }

    [XmlAttribute("totalvotes")]
    public int TotalVotes { get; set; }

    [XmlElement("results")]
    public List<PollResults> Results { get; set; }
}

public class PollResults {

    [XmlAttribute("numplayers")]
    public string NumPlayers { get; set; }

    [XmlElement("result")]
    public List<PollResult> Results { get; set; }
}

public class PollResult{
    [XmlAttribute("value")]
    public string Value { get; set; }

    [XmlAttribute("numvotes")]
    public int NumVotes { get; set; }
}

public class Statistics {
    [XmlElement("ratings")]
    public List<Ratings> Ratings { get; set; }
}

public class Ratings {
    [XmlElement("usersrated")]
    public IntValueAttribute UsersRated { get; set; }

    [XmlElement("average")]
    public DoubleValueAttribute Average { get; set; }

    [XmlElement("bayesaverage")]
    public DoubleValueAttribute BayesAverage { get; set; }

    [XmlElement("stddev")]
    public DoubleValueAttribute StdDev { get; set; }

    [XmlElement("median")]
    public IntValueAttribute Median { get; set; }

    [XmlElement("owned")]
    public IntValueAttribute Owned { get; set; }

    [XmlElement("trading")]
    public IntValueAttribute Trading { get; set; }

    [XmlElement("wanting")]
    public IntValueAttribute Wanting { get; set; }

    [XmlElement("wishing")]
    public IntValueAttribute Wishing { get; set; }

    [XmlElement("numcomments")]
    public IntValueAttribute NumComments { get; set; }

    [XmlElement("numweights")]
    public IntValueAttribute NumWeights { get; set; }

    [XmlElement("averageweight")]
    public DoubleValueAttribute AverageWeight { get; set; }
}

public enum NameType {
    [XmlEnum("primary")]
    Primary,
    [XmlEnum("alternate")]
    Alternate,
}

public enum LinkType {
    [XmlEnum("boardgamecategory")]
    Category,
    [XmlEnum("boardgamemechanic")]
    Mechanic,
    [XmlEnum("boardgamefamily")]
    Family,
    [XmlEnum("boardgameexpansion")]
    Expansion,
    [XmlEnum("boardgamedesigner")]
    Designer,
    [XmlEnum("boardgameartist")]
    Artist,
    [XmlEnum("boardgamecompilation")]
    Compilation,
    [XmlEnum("boardgameintegration")]
    Integration,
    [XmlEnum("boardgamepublisher")]
    Publisher,
    [XmlEnum("boardgameimplementation")]
    Implementation,
}

public enum PollName {
    [XmlEnum("suggested_numplayers")]
    SuggestedNumPlayers,
    [XmlEnum("suggested_playerage")]
    SuggestedPlayerAge,
    [XmlEnum("language_dependence")]
    LanguageDependence,
}
